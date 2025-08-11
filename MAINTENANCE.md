# Maintenance Guide - Anchor Builders ADU Generator

## 🔧 **Regular Maintenance Tasks**

### **Weekly Tasks**
- [ ] Check Railway deployment status and logs
- [ ] Verify application is loading correctly in production  
- [ ] Monitor build times and performance metrics
- [ ] Review any error reports or user feedback

### **Monthly Tasks**
- [ ] Update dependencies with security patches
- [ ] Review and update pricing configurations if needed
- [ ] Check Google Maps API usage and limits
- [ ] Verify SSL certificates and domain settings

### **Quarterly Tasks**
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] User feedback analysis and improvements
- [ ] Backup and disaster recovery testing

---

## 📊 **Performance Monitoring**

### **Key Metrics to Track**

| Metric | Target | Current | Monitor |
|--------|--------|---------|---------|
| Build Time | <10s | 7.50s | ✅ Good |
| Bundle Size | <500KB gzipped | 380KB | ✅ Excellent |
| Page Load | <3s | ~2s | ✅ Good |
| Error Rate | <1% | <0.1% | ✅ Excellent |

### **Performance Commands**
```bash
# Build time analysis
time npm run build

# Bundle size analysis  
npm run build && ls -lh dist/assets/

# Development server health
curl -I http://localhost:5000/

# Production deployment health
curl -I https://your-railway-url/
```

---

## 🛡️ **Security Maintenance**

### **Security Checklist (Monthly)**
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review and update input validation rules
- [ ] Check for new security headers recommendations
- [ ] Verify rate limiting is functioning
- [ ] Test XSS protection on all form inputs

### **Security Commands**
```bash
# Dependency vulnerability scan
npm audit

# Fix automatic vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Security-focused dependency update
npm update --save
```

### **Input Validation Testing**
Test these scenarios monthly:
- Malicious HTML in form inputs: `<script>alert('xss')</script>`
- Long strings: 1000+ character inputs
- Special characters: `'"&<>{}[]`
- SQL injection attempts: `'; DROP TABLE users; --`
- Template injection: `{{constructor.constructor('alert(1)')()}}`

---

## 📦 **Dependency Management**

### **Current Critical Dependencies**
```json
{
  "react": "^18.2.0",
  "jspdf": "^3.0.1", 
  "lucide-react": "^0.460.0",
  "class-variance-authority": "^0.7.1",
  "react-hook-form": "^7.60.0",
  "react-router-dom": "^6.26.2"
}
```

### **Update Strategy**
1. **Security updates**: Apply immediately
2. **Minor updates**: Test in development first
3. **Major updates**: Plan and test thoroughly

### **Update Commands**
```bash
# Check for security updates
npm audit

# Update dev dependencies
npm update --save-dev

# Update production dependencies (carefully)
npm update --save

# Verify after updates
npm run lint && npm run build
```

---

## 🚀 **Deployment Maintenance**

### **Railway Deployment Health**

**Monitor these in Railway dashboard:**
- Build success rate
- Deployment frequency  
- Memory usage trends
- Request response times

### **Environment Variables Checklist**
```bash
# Required for production
NODE_ENV=production

# Company branding (optional - has defaults)
VITE_COMPANY_NAME="Anchor Builders"
VITE_COMPANY_WEBSITE="https://www.anchorbuilders.io" 
VITE_SUPPORT_EMAIL="support@anchorbuilders.io"
VITE_SUPPORT_PHONE="(555) 123-4567"

# API integrations (optional)
VITE_GOOGLE_MAPS_API_KEY="your-key-here"
VITE_API_URL="https://your-api.railway.app"
VITE_API_KEY="your-api-key"
```

### **Deployment Troubleshooting**

**Build Failures:**
1. Check Railway build logs
2. Verify Node.js version (>=20.19.0)
3. Ensure all dependencies are in package.json
4. Test build locally: `npm run build`

**Runtime Errors:**
1. Check Railway application logs
2. Verify environment variables are set
3. Test production build locally: `npm run preview`
4. Check for missing static files

---

## 🔄 **Code Maintenance**

### **Code Quality Gates**
All changes must pass:
```bash
# TypeScript compilation
npx tsc --noEmit

# Linting (0 warnings required)
npm run lint

# Build success
npm run build

# Security audit
npm audit
```

### **File Organization Standards**
- **Active files**: Use files in main `src/` directory
- **Archived files**: Located in `archive/2025-08-11-production-cleanup/`
- **No backup files**: `.backup`, `.old`, `-Clean` files are archived
- **Recovery**: See `archive/README.md` for file recovery procedures

### **Security Utils Maintenance**
Key security functions in `src/lib/security-utils.ts`:
- `sanitizeHtmlInput()` - XSS protection
- `sanitizeTemplateValue()` - PDF injection prevention  
- `validateEmail()` - Email format validation
- `RateLimiter` - API abuse prevention

---

## 🐛 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **PDF Generation Fails**
**Symptoms**: User reports "PDF not generating"
**Debug Steps**:
1. Check browser console for JavaScript errors
2. Verify form validation is passing
3. Check rate limiting (3 PDFs per minute per user)
4. Test with minimal data

**Solution**:
```bash
# Test PDF generation locally
npm run dev
# Navigate to app, fill form, try PDF generation
```

#### **Form Validation Issues**
**Symptoms**: Users can't submit forms
**Debug Steps**:
1. Check input sanitization functions
2. Verify validation rules in components
3. Test with known good data

**Solution**:
```javascript
// Check validation in browser console
validateEmail("test@example.com") // should return true
sanitizeHtmlInput("<script>") // should return "&lt;script&gt;"
```

#### **Build or Deploy Failures**
**Symptoms**: Railway deployments failing
**Debug Steps**:
1. Check Railway build logs
2. Verify all dependencies in package.json
3. Test build locally

**Solution**:
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm ci
npm run build
```

---

## 📈 **Performance Optimization**

### **Bundle Size Monitoring**
Current optimized sizes:
- **vendor**: 710KB (206KB gzipped) - React core
- **pdf**: 348KB (111KB gzipped) - jsPDF 
- **form-components**: 89KB (10KB gzipped) - Main UI
- **Total**: ~380KB gzipped

### **Optimization Opportunities**
1. **Image optimization**: Compress logo and static assets
2. **Font optimization**: Subset Google Fonts if using
3. **Code splitting**: Further split large components if needed
4. **Caching**: Implement service worker for static assets

### **Performance Testing**
```bash
# Build and analyze
npm run build

# Check bundle sizes
ls -lh dist/assets/

# Test load times
npm run preview
# Use browser dev tools Network tab
```

---

## 🔄 **Backup & Recovery**

### **Important Files to Backup**
- `src/data/pricing-config.ts` - Business pricing rules
- `src/lib/pdf-template-generator.ts` - PDF generation logic
- `railway.toml` - Deployment configuration
- `.env.example` - Environment template
- `DEPLOYMENT.md` - Production procedures

### **Recovery Procedures**

**Code Recovery**:
```bash
# Restore from archive if needed
cp archive/2025-08-11-production-cleanup/components/EnhancedProductionGrid.tsx src/components/

# Verify functionality
npm run dev
```

**Deployment Recovery**:
```bash
# Rollback in Railway dashboard to last working deployment
# Or redeploy from known good commit
git checkout <working-commit-hash>
railway up
```

---

## 📞 **Support Escalation**

### **Level 1: Self-Service**
- Check this maintenance guide
- Review browser console errors
- Test in development environment
- Check Railway deployment logs

### **Level 2: Development Team**
Contact when:
- Security vulnerabilities discovered
- Performance significantly degraded
- Multiple user reports of issues
- Deployment repeatedly failing

### **Level 3: Emergency**
Immediately escalate for:
- Security breach or vulnerability
- Complete service outage >1 hour
- Data corruption or loss
- Malicious activity detected

### **Emergency Rollback Procedure**
```bash
# 1. Quick Railway rollback via dashboard
# 2. Or immediate code rollback
git checkout main
git reset --hard <last-working-commit>
railway up

# 3. Verify service restoration
curl -I https://your-railway-url/
```

---

## 📋 **Change Log Template**

Use this format for maintenance changes:

```markdown
## [Date] - [Change Type]

### Changed
- Updated dependency X from v1.0 to v1.1
- Modified pricing configuration for ADU types

### Security  
- Fixed XSS vulnerability in form input
- Updated rate limiting rules

### Performance
- Optimized bundle size by 15KB
- Improved build time by 2 seconds

### Testing
- Verified all form functionality
- Tested PDF generation with new data
- Confirmed mobile responsiveness
```

---

## 🎯 **Maintenance Success Metrics**

### **Monthly Goals**
- ✅ Zero security vulnerabilities
- ✅ <10s build times maintained
- ✅ <1% error rate
- ✅ >99% uptime
- ✅ All dependencies up-to-date

### **Quarterly Reviews**
- Performance benchmarking
- Security audit results
- User feedback integration
- Technology stack evaluation
- Business requirements changes

---

**⚠️ Remember**: Always test changes in development before applying to production. The application has comprehensive security and performance optimizations that must be preserved during maintenance.

---

*Maintenance Guide v3.0 - Last updated: August 2025*
*For technical support: Contact development team*