# 🚀 DEPLOYMENT RUNBOOK
**Anchor Builders ADU Generator → Railway**

---

## 📋 ONE-TIME SETUP

### 1. Railway Project Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to existing project (if exists)
railway link

# Or create new project
railway init
```

### 2. Environment Variables Setup
Set these in **Railway Dashboard → Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `VITE_API_URL` | `https://your-api-url` | ❓ Optional |
| `VITE_GOOGLE_MAPS_API_KEY` | `your-api-key` | ❓ Optional |
| `PORT` | `5000` | ✅ Yes |

### 3. Domain Configuration (Optional)
```bash
# Add custom domain
railway domain add your-domain.com
```

---

## 🏗️ BUILD & DEPLOY PROCESS

### Railway Configuration (`railway.toml`)
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run build && npm run preview -- --host 0.0.0.0 --port 5000"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[variables]
NODE_ENV = "production"
```

### Deploy Steps:
```bash
# 1. Verify local build works
npm run build

# 2. Deploy to Railway
git push origin main
# OR
railway up

# 3. Monitor deployment
railway logs --tail

# 4. Check deployment status
railway status
```

---

## 🔍 HEALTH CHECKS

### Post-Deploy Verification:
```bash
# 1. Check app loads
curl -I https://your-app.up.railway.app/

# 2. Verify assets load
curl -I https://your-app.up.railway.app/anchor-builders-logo.png

# 3. Test API endpoint (if applicable)
curl https://your-app.up.railway.app/api/health

# 4. Check template loading
curl -I https://your-app.up.railway.app/ENHANCED-AUG8-CHECKPOINT.html
```

### Manual Testing Checklist:
- [ ] App loads at Railway URL
- [ ] Form can be filled out
- [ ] PDF generation works
- [ ] Logo appears in PDFs  
- [ ] Template resolver selects ENHANCED-AUG8-CHECKPOINT.html
- [ ] All pricing calculations work
- [ ] Mobile responsive design works

---

## 📊 MONITORING & LOGS

### View Logs:
```bash
# Real-time logs
railway logs --tail

# Recent logs
railway logs

# Filter by service (if multiple)
railway logs --service web
```

### Key Log Messages to Watch:
```
✅ "Template resolver: Selected ENHANCED-AUG8-CHECKPOINT.html"
✅ "Logo loaded for PDF (size: XXXX chars)"
✅ "PDF generation completed successfully"
❌ "Template not found" or "Logo failed to load"
```

### Performance Monitoring:
- **Response Time:** Should be <2s for page loads
- **PDF Generation:** Should be <5s
- **Memory Usage:** Monitor for leaks during PDF generation
- **Error Rate:** Should be <1%

---

## 🔄 ROLLBACK PROCEDURE

### Immediate Rollback:
```bash
# 1. Check recent deployments
railway deployments

# 2. Rollback to previous deployment
railway rollback <deployment-id>

# 3. Verify rollback success
curl -I https://your-app.up.railway.app/
```

### Emergency Rollback (if Railway CLI not available):
1. Go to **Railway Dashboard**
2. Click on **Deployments** tab
3. Find last working deployment
4. Click **Redeploy**

### Git-based Rollback:
```bash
# 1. Revert to last working commit
git revert HEAD

# 2. Push revert commit
git push origin main

# 3. Railway will auto-deploy the revert
```

---

## 🐛 TROUBLESHOOTING

### Common Issues:

#### 1. **Build Fails**
```bash
# Check build locally
npm ci
npm run build

# Common fixes:
- Clear node_modules: rm -rf node_modules && npm ci
- Check TypeScript errors: npx tsc --noEmit
- Check ESLint: npm run lint
```

#### 2. **Template Not Loading**
```bash
# Verify template exists
ls -la public/ENHANCED-AUG8-CHECKPOINT.html

# Check resolver logs in Railway
railway logs --tail | grep "Template"

# Template resolver should show:
✅ "Selected ENHANCED-AUG8-CHECKPOINT.html (primary choice)"
```

#### 3. **Logo Not Showing**
```bash
# Check logo file exists
ls -la public/anchor-builders-logo.png

# Verify base64 loading in logs
railway logs --tail | grep "Logo"

# Should see:
✅ "Logo loaded for PDF (size: XXXX chars)"
```

#### 4. **PDF Generation Fails**
Check Railway logs for:
- Memory issues (increase Railway plan)
- Template variable errors
- Logo loading failures
- Timeout issues

#### 5. **Port/Binding Issues**
Verify `railway.toml`:
```toml
startCommand = "npm run preview -- --host 0.0.0.0 --port 5000"
```

---

## 🔧 CONFIGURATION FILES

### Required Files:
- ✅ `railway.toml` - Railway configuration
- ✅ `package.json` - Dependencies and scripts  
- ✅ `vite.config.ts` - Build configuration
- ✅ `.env.example` - Environment variables template

### Key Scripts in package.json:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite",
    "lint": "eslint . --max-warnings 0"
  }
}
```

---

## 📈 SCALING CONSIDERATIONS

### Railway Plan Requirements:
- **Hobby Plan:** OK for development/testing
- **Pro Plan:** Recommended for production
- **Memory:** 512MB minimum (PDF generation is memory intensive)
- **CPU:** Standard should be sufficient

### Performance Optimization:
- **PDF Generation:** Consider moving to background jobs for large PDFs
- **Asset Optimization:** Images already optimized in build
- **Caching:** Consider CDN for static assets

---

## 🔐 SECURITY CHECKLIST

### Pre-deployment Security:
- [ ] No API keys in source code
- [ ] All secrets in Railway environment variables
- [ ] HTTPS enforced (Railway does this automatically)
- [ ] No sensitive data in logs
- [ ] Dependencies up to date: `npm audit`

### Post-deployment Security:
- [ ] Test with security headers
- [ ] Verify no sensitive data exposed
- [ ] Check that admin functions require auth (if any)

---

## 📞 SUPPORT & ESCALATION

### For Deployment Issues:
1. **Check this runbook first**
2. **Review Railway logs**
3. **Test locally with same environment**
4. **Check Railway status page**
5. **Contact Railway support if platform issue**

### For Application Issues:
1. **Check PROD_AUDIT.md for known issues**
2. **Review recent commits**
3. **Check if issue exists in dev environment**
4. **Rollback if critical**

---

## 📝 DEPLOYMENT HISTORY TEMPLATE

```markdown
## Deployment: YYYY-MM-DD HH:MM

**Branch:** main
**Commit:** <hash>
**Deploy Time:** <duration>
**Status:** ✅ Success / ❌ Failed

**Changes:**
- Template resolver implementation
- Logo base64 helper
- TypeScript error fixes

**Verification:**
- [ ] App loads
- [ ] PDF generation works  
- [ ] Template resolver logs correct selection
- [ ] Logo displays in PDFs

**Issues:** None
**Rollback Required:** No
```

---

**Last Updated:** 2025-08-11  
**Branch:** chore/prod-readiness-AUG8-template  
**Railway Project:** Anchor Builders ADU Generator