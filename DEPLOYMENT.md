# Railway Deployment Guide - Anchor Builders ADU Generator

## Problem Solved
**Issue**: Vite preview binds to `localhost` instead of `0.0.0.0`, making Railway health checks fail  
**Solution**: Express server with explicit `0.0.0.0` binding for containerized environments

## Architecture

```
Railway Container → Express Server (0.0.0.0:8080) → Static Files (dist/)
                                  ↓
                            Health Checks (/health, /healthz)
                            SPA Routing (/* → index.html)
```

## Files Created

### Core Server
- **`server.js`** - Express server with 0.0.0.0 binding
- **`nixpacks.toml`** - Railway build configuration
- **`Dockerfile`** - Alternative containerization option

### Scripts & Testing
- **`scripts/verify-build.js`** - Pre-deployment build verification
- **`scripts/test-production.sh`** - Comprehensive deployment testing

## Deployment Process

### 1. Local Testing
```bash
# Build the app
npm run build

# Verify build artifacts
node scripts/verify-build.js

# Start production server locally
npm run start:production

# Test locally
./scripts/test-production.sh local
```

### 2. Railway Deployment
```bash
# Commit changes
git add .
git commit -m "fix: add Express server for Railway deployment"
git push origin main

# Railway will auto-deploy using nixpacks.toml configuration

# Test production deployment
./scripts/test-production.sh production
```

### 3. Verification
```bash
# Check health endpoints
curl https://anchor-builders-adu-generator-production.up.railway.app/health
curl https://anchor-builders-adu-generator-production.up.railway.app/healthz

# Verify main app loads
curl -I https://anchor-builders-adu-generator-production.up.railway.app/

# Run full test suite
./scripts/test-production.sh both
```

## Configuration Details

### Express Server Features
- ✅ **Explicit 0.0.0.0 binding** - Works in containers
- ✅ **Static file serving** - Serves Vite build from `dist/`
- ✅ **SPA routing support** - All routes serve `index.html`
- ✅ **Health check endpoints** - `/health` and `/healthz`
- ✅ **Compression** - Gzip compression for performance
- ✅ **Security headers** - Basic security hardening
- ✅ **Error handling** - Graceful error responses
- ✅ **Graceful shutdown** - Proper SIGTERM handling

### Railway Configuration (nixpacks.toml)
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[phases.start]
cmd = "npm run start:production"
```

### Package.json Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "start:production": "NODE_ENV=production node server.js",
    "build": "tsc && vite build",
    "test": "npm run lint && npm run build"
  }
}
```

## Troubleshooting

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Health check fails | Railway shows unhealthy | Verify server binds to 0.0.0.0 |
| 404 on routes | Client routing broken | Check SPA fallback in server.js |
| Static assets missing | CSS/JS not loading | Verify `dist/` exists and is served |
| Build fails | Railway build errors | Check `nixpacks.toml` configuration |

### Debug Commands
```bash
# Check Railway logs
railway logs --tail 100

# Verify dist/ directory locally
ls -la dist/

# Test server binding locally
netstat -tlnp | grep 8080

# Check health endpoint response
curl -v https://anchor-builders-adu-generator-production.up.railway.app/health
```

### Environment Variables
Railway automatically sets:
- `PORT=8080` (or Railway assigns)
- `NODE_ENV=production`

No additional environment variables required.

## Expected Responses

### Health Check (`/health`)
```json
{
  "status": "ok",
  "service": "anchor-builders-adu-generator",
  "timestamp": "2025-08-12T...",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Main App (`/`)
- Returns Vite-built `index.html`
- Loads React application
- Client-side routing works

## Rollback Procedure
If deployment fails:

1. **Immediate**: Railway dashboard → Previous deployment → Redeploy
2. **Code rollback**: `git revert <commit-hash> && git push`
3. **Emergency**: Switch Railway to previous working branch

## Success Criteria
- ✅ Railway deployment shows "Active" status
- ✅ Health checks return 200 OK
- ✅ Main app loads in browser
- ✅ All client routes work (React Router)
- ✅ No console errors in browser
- ✅ PDF generation functional (if using server-side service)

## Production URLs
- **Main**: https://anchor-builders-adu-generator-production.up.railway.app
- **Health**: https://anchor-builders-adu-generator-production.up.railway.app/health
- **Health (Railway)**: https://anchor-builders-adu-generator-production.up.railway.app/healthz

---

*This configuration replaces the broken `vite preview --host 0.0.0.0` approach with a production-ready Express server that properly binds to all network interfaces for Railway's containerized environment.*