# Anchor Builders ADU Proposal Generator

**Production-Ready Internal Tool for Professional ADU Construction Proposals**

---

## 🎯 **PROJECT OVERVIEW**

The Anchor Builders ADU Proposal Generator is a sophisticated internal tool designed for the Anchor Builders construction team to create professional, branded proposals for Accessory Dwelling Unit (ADU) projects.

### **Recent Improvements Completed**
- ✅ **Critical PDF validation fix** - Resolved "State is required" error preventing PDF generation
- ✅ **Mobile touch targets** - All interactive elements now meet 44px accessibility requirements
- ✅ **Professional color palette** - Navy blue header with construction orange accents
- ✅ **Progress indicators** - Added percentage completion display (33%, 67%, 100%)
- ✅ **Trust badges** - Internal tool-focused credibility markers
- ✅ **Production testing** - Comprehensive quality assurance completed

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment Requirements**

- [ ] Node.js >= 20.19.0 installed
- [ ] npm >= 10.0.0 installed
- [ ] Environment variables configured
- [ ] Google Maps API configured (optional)

### **Build Verification**
```bash
# Install dependencies
npm install

# Run linting (must pass with 0 warnings)
npm run lint

# Build for production
npm run build

# Test production build locally
npm run preview
```

### **Quality Gates**
- [ ] All TypeScript compilation errors resolved
- [ ] ESLint passes with 0 warnings
- [ ] Production build completes successfully
- [ ] PDF generation works with test data
- [ ] All form validation functions correctly
- [ ] Mobile responsiveness verified

---

## 🌐 **PRODUCTION DEPLOYMENT**

### **Railway Deployment (Recommended)**

This application is optimized for Railway deployment with automatic builds and monitoring.

#### **Railway Configuration** (Already Configured)
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview -- --host 0.0.0.0 --port 5000`
- **Port**: 5000
- **Health Checks**: Enabled
- **Auto-restart**: ON_FAILURE with 10 max retries

#### **Deployment Steps**

1. **Login to Railway**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**
   ```bash
   railway up
   ```

3. **Set Environment Variables** in Railway dashboard

### **Alternative Platforms**

#### **Vercel**
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## ⚙️ **ENVIRONMENT CONFIGURATION**

### **Required Variables**

```bash
NODE_ENV=production
VITE_COMPANY_NAME="Anchor Builders"
VITE_COMPANY_WEBSITE="https://www.anchorbuilders.io"
VITE_SUPPORT_EMAIL="support@anchorbuilders.io"
VITE_SUPPORT_PHONE="(555) 123-4567"
```

### **Optional Variables**

```bash
# Google Maps Integration
VITE_GOOGLE_MAPS_API_CONFIG="your-google-maps-api-config"
VITE_GOOGLE_MAPS_DEFAULT_ZOOM=19
VITE_GOOGLE_MAPS_IMAGE_SIZE="800x600"
VITE_ENABLE_GOOGLE_MAPS=true

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PDF_GENERATION=true
```

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 18.2 + TypeScript | Component-based UI |
| Styling | Tailwind CSS | Utility-first styling |
| Forms | React Hook Form + Zod | Form validation |
| State | Zustand | Client state management |
| PDF | jsPDF + html2canvas | PDF generation |
| Icons | Lucide React | Consistent iconography |
| Build | Vite 6.1 | Fast build tool |
| Deployment | Railway | Production hosting |

### **Project Structure**

```
src/
├── components/           # Reusable UI components
├── data/                 # Business logic and pricing rules
├── lib/                  # Core functionality (PDF, pricing)
├── pages/                # Page-level components
├── types/                # TypeScript interfaces
├── utils/                # Helper functions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

### **Main Application Flow**
1. **ProjectDetailsForm** - Collect client and project information
2. **PricingCalculator** - Configure pricing and options
3. **ProposalSummary** - Review and generate PDF

---

## 💼 **BUSINESS FEATURES**

### **Core Functionality**

#### **Multi-Step Proposal Wizard**
- **Step 1**: Client Information & Project Address
- **Step 2**: ADU Specifications & Pricing Options  
- **Step 3**: Review & PDF Generation

#### **Dynamic Pricing Engine**
- **ADU Types**: Detached (1-2 story), Attached
- **Base Pricing**: $200-$240 per square foot
- **Utilities**: Separate vs shared metering options
- **Add-ons**: Extra bathrooms, driveways, landscaping
- **Design Services**: $12,500 comprehensive design package

#### **Professional PDF Proposals**
- **Company Branding**: Anchor Builders logo and colors
- **Satellite Imagery**: Google Maps integration for property visualization
- **Detailed Pricing**: Line-item breakdown with milestone payments
- **Contact Information**: Professional formatting with company details

### **Administrative Features**
- Save and retrieve proposals
- Edit existing proposals
- Status tracking (draft, sent, approved)
- Pricing overrides and customization

### **Mobile Optimization**
- Touch-friendly 44px minimum target sizes
- Responsive design for tablets and phones
- Optimized form layouts for mobile input

---

## 🔧 **MAINTENANCE GUIDE**

### **Updating Pricing Configuration**

Pricing is managed in `/src/data/pricing-config.ts`:

```typescript
// Update base pricing per square foot
export const aduTypePricing: AduTypePricing[] = [
  {
    name: 'Detached ADU (1-Story)',
    type: 'detached',
    stories: 1,
    pricePerSqFt: 220, // Update this value
    description: 'Single level standalone unit',
  }
];

// Update add-on pricing
export const addOnOptions: AddOnOption[] = [
  {
    name: 'Extra Bathroom',
    price: 8000, // Update this value
    description: 'Additional bathroom beyond standard',
  }
];
```

### **Modifying PDF Templates**

PDF layout is in `/src/lib/pdf-template-generator.ts`:

```typescript
// Company branding
const COMPANY_INFO = {
  name: 'Anchor Builders',
  tagline: 'Professional ADU Construction',
  phone: '(555) 123-4567',
  email: 'info@anchorbuilders.io',
  website: 'www.anchorbuilders.io'
};

// Color scheme
const COLORS = {
  primary: '#1e3a8a',     // Navy blue
  accent: '#ea580c',      // Construction orange
  text: '#1f2937',        // Dark gray
  background: '#f9fafb'   // Light gray
};
```

### **Common Troubleshooting**

#### **PDF Generation Issues**
- Verify all required form fields are completed
- Check browser console for jsPDF errors
- Ensure proper error handling in PDF generator

#### **Google Maps Not Loading**
- Verify API configuration is set in environment variables
- Check API restrictions in Google Cloud Console
- Ensure Maps Static API is enabled

#### **Pricing Calculation Errors**
- Validate pricing configuration in `pricing-config.ts`
- Check for missing add-on definitions
- Verify markup percentage calculations

---

## 🐛 **KNOWN ISSUES & IMPROVEMENTS**

### **Current Limitations**
- **PDF Performance**: Large images may slow generation (1-2 seconds)
- **Form State**: No auto-save functionality (planned for v2.1)
- **Offline Support**: Requires internet connection for Google Maps

### **Planned Improvements**
- [ ] Implement image caching for Google Maps
- [ ] Add form auto-save with localStorage
- [ ] Optimize PDF generation with web workers
- [ ] Email integration for PDF sending
- [ ] Advanced proposal templates

---

## 🧪 **TESTING STRATEGY**

### **Manual Testing Checklist**

#### **Core Functionality**
- [ ] Complete proposal creation workflow
- [ ] PDF generation with all add-ons
- [ ] Form validation with invalid inputs
- [ ] Mobile device compatibility
- [ ] Google Maps integration (if enabled)

#### **Browser Compatibility**
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### **Automated Testing**

```bash
# Run type checking
npx tsc --noEmit

# Run linting
npm run lint

# Run build verification
npm run build
```

---

## 📞 **SUPPORT & CONTACTS**

### **Technical Support**
- **Primary Contact**: Vinh (Lead Developer)
- **Repository**: Private GitHub repository

### **Business Support**
- **Project Owner**: Business stakeholder
- **End Users**: Construction team members

### **Escalation Process**
1. Check this documentation
2. Review browser console for errors
3. Contact development team
4. Emergency rollback to previous version

---

## 📈 **MONITORING**

### **Performance Targets**
- **Page Load Time**: <2 seconds
- **PDF Generation Time**: <3 seconds
- **Error Rate**: <1%
- **Uptime**: 99.9%

### **Business Metrics**
- Proposals created (daily/weekly)
- PDF downloads
- User adoption rates
- Client feedback

---

## 🔄 **VERSION HISTORY**

### **v2.0 (Current) - Production Ready**
- ✅ Complete UI/UX overhaul
- ✅ Mobile optimization
- ✅ Professional color scheme
- ✅ Progress indicators
- ✅ Critical bug fixes
- ✅ Google Maps integration
- ✅ Comprehensive testing

### **v1.0 - Initial Release**
- Basic proposal generation
- PDF export functionality
- Simple pricing calculation
- Desktop-focused design

---

**🏗️ Built for Anchor Builders - Professional ADU Construction Services**

*Last updated: January 2025*
*Version: 2.0*
*Status: Production Ready*