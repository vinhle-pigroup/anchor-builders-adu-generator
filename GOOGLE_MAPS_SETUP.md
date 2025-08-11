# Google Maps API Setup Guide

This guide walks you through setting up Google Maps integration for the Anchor Builders ADU Generator.

## Prerequisites

- Google Cloud Platform account
- Access to Google Cloud Console
- Billing enabled on your Google Cloud project

## Step 1: Create Google Cloud Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Anchor Builders ADU Generator"
4. Click "Create"

## Step 2: Enable Required APIs

1. Navigate to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Maps Static API** (Required)
   - **Geocoding API** (Optional - for address validation)

## Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (format: `AIza...`)

## Step 4: Secure Your API Key

### For Production Use:

1. Click on your API key to edit it
2. Under "API restrictions", select "Restrict key"
3. Choose "Maps Static API" (and Geocoding API if enabled)
4. Under "Website restrictions":
   - Add your Railway domain: `anchor-builders-adu-generator-production.up.railway.app`
   - Add localhost for development: `localhost:5000`

### For Development:
- You can leave unrestricted for testing, but restrict for production

## Step 5: Configure Environment Variables

### Local Development:

1. Copy the environment example:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIza_your_actual_api_key_here
   VITE_ENABLE_GOOGLE_MAPS=true
   ```

### Railway Production Deployment:

1. Open Railway dashboard for your project
2. Go to "Variables" tab
3. Add these environment variables:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIza_your_actual_api_key_here
   VITE_GOOGLE_MAPS_DEFAULT_ZOOM=19
   VITE_GOOGLE_MAPS_IMAGE_SIZE=800x600
   VITE_GOOGLE_MAPS_HEADER_SIZE=120x80
   VITE_ENABLE_GOOGLE_MAPS=true
   ```

## Step 6: Test Your Setup

### Local Testing:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser console and check for Google Maps logs
3. Create a test proposal with an address
4. Verify satellite images load in the PDF

### Production Testing:

1. Deploy to Railway
2. Test with a real address
3. Check browser console for any API errors

## Troubleshooting

### Common Issues:

**"API key not valid" Error:**
- Check that Maps Static API is enabled
- Verify API key is correctly set in environment variables
- Ensure billing is enabled on Google Cloud project

**"This API project is not authorized" Error:**
- Add your domain to API key restrictions
- For Railway: `*.up.railway.app`

**Images not loading:**
- Check browser network tab for failed requests
- Verify environment variable names use `VITE_` prefix
- Check that addresses are properly formatted

**Rate limit exceeded:**
- Google Maps Static API allows 25,000 requests/day free
- Monitor usage in Google Cloud Console
- Consider adding request caching if needed

## API Usage & Costs

### Current Usage Pattern:
- 1-2 images per proposal (header + showcase)
- Typical image size: 800x600 or 120x80
- Average: ~2-3 API calls per proposal

### Cost Breakdown:
- Maps Static API: $2 per 1,000 requests
- Free tier: $200 monthly credit
- Estimated monthly cost for 100 proposals: ~$0.40

### Monitoring Usage:
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Dashboard"
3. Click on "Maps Static API"
4. View usage charts and quotas

## Security Best Practices

1. **Never commit API keys to git**
2. **Use domain restrictions** for production keys
3. **Set up billing alerts** to monitor costs
4. **Rotate API keys** periodically
5. **Monitor usage** for unexpected spikes

## Integration Code Example

The application uses the Google Maps service located at:
`src/lib/google-maps-service.ts`

Basic usage:
```typescript
import { getSafePropertyImage } from './lib/google-maps-service';

// Get satellite image for PDF
const imageDataUri = await getSafePropertyImage('123 Main St, Seattle, WA');
if (imageDataUri) {
  // Use in PDF generation
  console.log('Image loaded successfully');
} else {
  console.log('Fallback to no image');
}
```

## Support

For issues with this integration:
1. Check browser console for detailed error messages
2. Verify Google Cloud Console API quotas and billing
3. Test with a simple address like "1600 Amphitheatre Parkway, Mountain View, CA"

For Google Maps API specific issues, refer to:
- [Maps Static API Documentation](https://developers.google.com/maps/documentation/maps-static)
- [Google Maps Platform Support](https://developers.google.com/maps/support)
EOF < /dev/null
