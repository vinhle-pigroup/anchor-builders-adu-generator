/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Real Anchor Builders brand colors from Excel design
        anchor: {
          50: '#f8fafc',    // Clean white background
          100: '#e8f4f8',   // Light blue accent  
          200: '#d1e7f0',   // Lighter navy
          300: '#94a3b8',   // Medium gray
          400: '#64748b',   // Darker gray
          500: '#1b365d',   // PRIMARY Navy Blue (brand color)
          600: '#2b5f75',   // Secondary navy
          700: '#0f1b2d',   // Dark navy
          800: '#0a0f1a',   // Very dark navy
          900: '#050810',   // Almost black
        },
        gold: {
          500: '#d4a574',   // Anchor gold accent
          600: '#b8860b',   // Warning gold
        },
        professional: {
          charcoal: '#333333',    // Body text
          gray: '#e8e8e8',        // Light borders
          'gray-light': '#f5f5f5', // Table alternating rows
        }
      },
    },
  },
  plugins: [],
};
