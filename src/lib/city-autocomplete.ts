/**
 * Orange County City Autocomplete with Fuzzy Matching
 * Provides intelligent city suggestions for Orange County, California
 */

// Complete list of Orange County cities
export const ORANGE_COUNTY_CITIES = [
  'Aliso Viejo',
  'Anaheim',
  'Brea',
  'Buena Park',
  'Costa Mesa',
  'Cypress',
  'Dana Point',
  'Fountain Valley',
  'Fullerton',
  'Garden Grove',
  'Huntington Beach',
  'Irvine',
  'La Habra',
  'La Palma',
  'Laguna Beach',
  'Laguna Hills',
  'Laguna Niguel',
  'Laguna Woods',
  'Lake Forest',
  'Los Alamitos',
  'Mission Viejo',
  'Newport Beach',
  'Orange',
  'Placentia',
  'Rancho Santa Margarita',
  'San Clemente',
  'San Juan Capistrano',
  'Santa Ana',
  'Seal Beach',
  'Stanton',
  'Tustin',
  'Villa Park',
  'Westminster',
  'Yorba Linda'
];

// Common misspellings and variations
const CITY_ALIASES: Record<string, string> = {
  // Irvine variations
  'irvin': 'Irvine',
  'irvn': 'Irvine',
  'irvine ca': 'Irvine',
  
  // Huntington Beach variations
  'hb': 'Huntington Beach',
  'huntington': 'Huntington Beach',
  'huntington bch': 'Huntington Beach',
  'hunting beach': 'Huntington Beach',
  
  // Newport Beach variations
  'newport': 'Newport Beach',
  'newport bch': 'Newport Beach',
  'newportbeach': 'Newport Beach',
  
  // Costa Mesa variations
  'costamesa': 'Costa Mesa',
  'costa': 'Costa Mesa',
  
  // Mission Viejo variations
  'mission': 'Mission Viejo',
  'missionviejo': 'Mission Viejo',
  'mission v': 'Mission Viejo',
  
  // San Juan Capistrano variations
  'sjc': 'San Juan Capistrano',
  'san juan': 'San Juan Capistrano',
  'capistrano': 'San Juan Capistrano',
  
  // Santa Ana variations
  'santaana': 'Santa Ana',
  'santa': 'Santa Ana',
  
  // Laguna variations
  'laguna': 'Laguna Beach', // Default to Laguna Beach
  'laguna bch': 'Laguna Beach',
  'lagunabeach': 'Laguna Beach',
  
  // Garden Grove variations
  'gardengrove': 'Garden Grove',
  'garden': 'Garden Grove',
  
  // Fountain Valley variations
  'fountainvalley': 'Fountain Valley',
  'fountain': 'Fountain Valley',
  
  // Lake Forest variations
  'lakeforest': 'Lake Forest',
  'lake': 'Lake Forest',
  
  // Yorba Linda variations
  'yorbalinda': 'Yorba Linda',
  'yorba': 'Yorba Linda',
  
  // Rancho Santa Margarita variations
  'rsm': 'Rancho Santa Margarita',
  'rancho': 'Rancho Santa Margarita',
  'santa margarita': 'Rancho Santa Margarita',
  
  // Aliso Viejo variations
  'aliso': 'Aliso Viejo',
  'alisoviejo': 'Aliso Viejo',
  
  // Dana Point variations
  'dana': 'Dana Point',
  'danapoint': 'Dana Point',
  
  // La Habra variations
  'lahabra': 'La Habra',
  'habra': 'La Habra',
  
  // La Palma variations
  'lapalma': 'La Palma',
  'palma': 'La Palma',
  
  // Los Alamitos variations
  'losalamitos': 'Los Alamitos',
  'alamitos': 'Los Alamitos',
  
  // San Clemente variations
  'sanclemente': 'San Clemente',
  'clemente': 'San Clemente',
  
  // Seal Beach variations
  'sealbeach': 'Seal Beach',
  'seal': 'Seal Beach',
  
  // Villa Park variations
  'villapark': 'Villa Park',
  'villa': 'Villa Park'
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings
 * Returns a value between 0 and 1, where 1 is an exact match
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - (distance / maxLength);
}

/**
 * Find matching cities based on user input with fuzzy matching
 */
export function findMatchingCities(input: string, maxResults: number = 5): string[] {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const normalizedInput = input.toLowerCase().trim();
  
  // Check for exact alias match first
  if (CITY_ALIASES[normalizedInput]) {
    return [CITY_ALIASES[normalizedInput]];
  }

  // Calculate similarity scores for all cities
  const cityScores = ORANGE_COUNTY_CITIES.map(city => {
    const normalizedCity = city.toLowerCase();
    
    // Exact match
    if (normalizedCity === normalizedInput) {
      return { city, score: 1.5 }; // Higher score for exact match
    }
    
    // Starts with input (prefix match)
    if (normalizedCity.startsWith(normalizedInput)) {
      return { city, score: 1.2 + (1 - normalizedInput.length / normalizedCity.length) * 0.3 };
    }
    
    // Contains input
    if (normalizedCity.includes(normalizedInput)) {
      return { city, score: 0.8 };
    }
    
    // Fuzzy matching with Levenshtein distance
    const similarity = calculateSimilarity(normalizedInput, normalizedCity);
    
    // Also check similarity with individual words in multi-word cities
    const words = city.split(' ');
    let maxWordSimilarity = similarity;
    for (const word of words) {
      const wordSimilarity = calculateSimilarity(normalizedInput, word.toLowerCase());
      maxWordSimilarity = Math.max(maxWordSimilarity, wordSimilarity * 0.9); // Slight penalty for partial match
    }
    
    return { city, score: maxWordSimilarity };
  });

  // Sort by score and filter out low scores
  const sortedCities = cityScores
    .filter(item => item.score > 0.3) // Only show reasonably close matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.city);

  return sortedCities;
}

/**
 * Auto-correct city name to the closest match
 * Returns the original input if no good match is found
 */
export function autoCorrectCity(input: string): string {
  if (!input || input.trim().length === 0) {
    return input;
  }

  const normalizedInput = input.toLowerCase().trim();
  
  // Check for exact match first (case-insensitive)
  const exactMatch = ORANGE_COUNTY_CITIES.find(
    city => city.toLowerCase() === normalizedInput
  );
  if (exactMatch) {
    return exactMatch;
  }
  
  // Check aliases
  if (CITY_ALIASES[normalizedInput]) {
    return CITY_ALIASES[normalizedInput];
  }
  
  // Find the best fuzzy match
  const matches = findMatchingCities(input, 1);
  if (matches.length > 0) {
    // Only auto-correct if the match is very close (similarity > 0.7)
    const similarity = calculateSimilarity(input, matches[0]);
    if (similarity > 0.7) {
      return matches[0];
    }
  }
  
  // Return original input if no good match found
  return input;
}

/**
 * Check if a city is a supported Orange County city
 */
export function isSupportedCity(city: string): boolean {
  if (!city) return false;
  const normalizedCity = city.toLowerCase().trim();
  return ORANGE_COUNTY_CITIES.some(
    ocCity => ocCity.toLowerCase() === normalizedCity
  );
}

/**
 * Get all Orange County cities (for dropdowns, etc.)
 */
export function getAllOrangeCountyCities(): string[] {
  return [...ORANGE_COUNTY_CITIES];
}