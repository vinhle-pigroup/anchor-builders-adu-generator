# Railway Deployment Guide - Anchor Builders ADU Generator

This guide will help you deploy the Anchor Builders ADU Proposal Generator to a separate Railway instance.

## Option 1: Deploy to New Railway Project (Recommended)

### Step 1: Create New Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose this repository
5. Set the **Root Directory** to: `apps/anchor-builders-adu-generator`

### Step 2: Configure Build Settings

Railway will automatically detect the `railway.toml` configuration, but verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

In Railway dashboard → Variables, add:

```bash
NODE_ENV=production
```

### Step 4: Deploy

1. Click "Deploy"
2. Railway will build and deploy automatically
3. You'll get a unique URL like: `https://anchor-builders-adu-generator-production.up.railway.app`

## Option 2: Deploy to Existing Railway Account

If you want to add this as a service to an existing Railway project:

### Step 1: Add Service to Existing Project

1. Open your existing Railway project
2. Click "New Service" 
3. Select "GitHub Repo"
4. Choose this repository
5. Set Root Directory: `apps/anchor-builders-adu-generator`

### Step 2: Configure Service

- **Service Name**: `anchor-builders-adu-generator`
- **Environment**: Production
- **Auto-deploy**: Enable for main branch

## Production Configuration

### Custom Domain (Optional)

1. In Railway dashboard → Settings
2. Add custom domain: `proposals.anchorbuilders.io`
3. Configure DNS CNAME record to point to Railway URL

### Environment Variables for Production

```bash
# Required
NODE_ENV=production

# Optional - Add as needed
VITE_API_URL=https://your-api-url.com
VITE_COMPANY_NAME="Anchor Builders"
VITE_SUPPORT_EMAIL=support@anchorbuilders.io
```

### SSL Certificate

Railway automatically provides SSL certificates for all deployments.

## Monitoring and Maintenance

### Health Checks

The app includes automatic health monitoring:
- **Uptime monitoring** via Railway dashboard
- **Error tracking** in deployment logs
- **Performance metrics** in Railway metrics panel

### Logs Access

View logs in Railway dashboard:
1. Go to your project
2. Click on the service
3. Click "Logs" tab
4. Filter by time range or log level

### Updates and Deployments

**Automatic Deployments:**
- Push to `main` branch triggers automatic deployment
- Railway rebuilds and redeploys automatically

**Manual Deployments:**
- Go to Railway dashboard
- Click "Deploy" button
- Select specific commit or branch

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **App Won't Start**
   - Verify PORT environment variable is used
   - Check start command in railway.toml
   - Review deployment logs

3. **Static Files Not Loading**
   - Ensure build command generates dist/ folder
   - Verify Vite configuration
   - Check file paths in build output

### Support

For deployment issues:
1. Check Railway status page
2. Review deployment logs
3. Contact Railway support if needed

## Cost Estimation

Railway pricing (as of current):
- **Hobby Plan**: $5/month for small apps
- **Pro Plan**: $20/month for production apps
- **Usage-based**: Additional costs for high traffic

For Anchor Builders ADU generator:
- Expected cost: $5-20/month depending on usage
- No traffic limits on paid plans
- Automatic scaling included

## Security Considerations

### Data Protection
- All traffic encrypted with SSL
- No sensitive data stored in frontend
- Environment variables secured by Railway

### Access Control
- Deploy keys managed by Railway
- GitHub integration with secure access
- Audit logs available in dashboard

---

**Ready to deploy!** The Anchor Builders ADU generator is production-ready for Railway deployment.