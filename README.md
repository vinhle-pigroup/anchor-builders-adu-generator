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

### Environment Variables

```bash
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

## Integration

This app can be integrated with:

- **CRM Systems**: For client data management
- **Project Management**: For proposal tracking
- **Accounting Software**: For cost tracking and invoicing
- **E-signature Services**: For digital contract signing

---

**Built for Anchor Builders** - Professional ADU construction services