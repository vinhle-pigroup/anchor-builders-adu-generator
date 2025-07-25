# Anchor Builders ADU Proposal Generator

Professional ADU proposal generation system for Anchor Builders construction company.

## Features

- **Multi-step Form Flow**: Client info → Project specs → Review & generate
- **Dynamic Pricing**: Real-time calculation based on project specifications
- **PDF Generation**: Professional proposal documents
- **Mobile Responsive**: Touch-friendly design for field use
- **Type Safe**: Full TypeScript implementation

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with Anchor Builders branding
- **Icons**: Lucide React
- **Deployment**: Railway

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Railway Deployment

This app is configured for Railway deployment with:

- **Automatic builds** from main branch
- **Environment variables** for configuration
- **Static file serving** for production
- **Health checks** and monitoring

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Select this directory (`apps/anchor-builders-adu-generator`) as the root
3. Railway will automatically detect the configuration from `railway.toml`
4. Set any required environment variables in Railway dashboard

#### Setting Up Google Maps API in Railway

1. Open your project in Railway dashboard
2. Go to "Variables" tab
3. Add the following environment variables:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
   VITE_GOOGLE_MAPS_DEFAULT_ZOOM=19
   VITE_GOOGLE_MAPS_IMAGE_SIZE=800x600
   VITE_GOOGLE_MAPS_HEADER_SIZE=120x80
   VITE_ENABLE_GOOGLE_MAPS=true
   ```
4. Deploy the application
5. Test satellite image generation


### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# Required for Google Maps integration:
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Optional configuration:
VITE_GOOGLE_MAPS_DEFAULT_ZOOM=19
VITE_GOOGLE_MAPS_IMAGE_SIZE="800x600"
NODE_ENV=production
# Add other environment variables as needed
```

## Project Structure

```
src/
├── components/           # Reusable UI components
├── lib/                 # Business logic and utilities
├── types/               # TypeScript type definitions
├── data/                # Static data and configurations
└── utils/               # Helper functions
```

## Form Flow

1. **Welcome Screen**: Anchor Builders branding and introduction
2. **Client Information**: Contact details and project address
3. **Project Specifications**: ADU type, size, foundation, sitework
4. **Review & Generate**: Summary and PDF proposal generation

## Pricing Engine

The pricing engine calculates costs based on:

- ADU type and square footage
- Foundation type (slab, crawl space, basement)
- Sitework requirements (minimal, moderate, extensive)
- Local permit and utility connection costs
- Additional services and customizations

## Google Maps Integration

This application uses Google Maps Static API to display satellite imagery of properties in PDF proposals.

### Required Google APIs

1. **Maps Static API** - For generating satellite images
2. **Geocoding API** (optional) - For address validation

### Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" → "Library"
4. Enable "Maps Static API"
5. Navigate to "APIs & Services" → "Credentials"
6. Click "Create Credentials" → "API Key"
7. Copy your API key

### API Key Security

For production use:
- Restrict your API key to specific domains
- Set up billing alerts to monitor usage
- Consider HTTP referrer restrictions

### Rate Limits & Costs

- Maps Static API: $2 per 1,000 requests
- Free tier: $200 monthly credit
- Typical usage: 1-3 requests per proposal

### Troubleshooting

- Check browser console for API errors
- Verify API key has proper permissions
- Ensure billing is enabled on Google Cloud project
- Test with a simple address first


## Integration

This app can be integrated with:

- **CRM Systems**: For client data management
- **Project Management**: For proposal tracking
- **Accounting Software**: For cost tracking and invoicing
- **E-signature Services**: For digital contract signing

---

**Built for Anchor Builders** - Professional ADU construction services