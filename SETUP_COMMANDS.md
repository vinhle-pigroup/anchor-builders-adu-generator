# Setup Commands for Anchor Builders ADU Generator

## After creating your GitHub repository, run these commands:

### 1. Initialize Git in the Anchor Builders directory
```bash
cd apps/anchor-builders-adu-generator
git init
git add .
git commit -m "Initial commit: Anchor Builders ADU Proposal Generator"
```

### 2. Connect to your new GitHub repository
Replace `YOUR_USERNAME` with your GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/anchor-builders-adu-generator.git
git branch -M main
git push -u origin main
```

### 3. Test the build locally
```bash
npm install
npm run build
npm run preview
```

## Example commands if your GitHub username is "john-doe":
```bash
cd apps/anchor-builders-adu-generator
git init
git add .
git commit -m "Initial commit: Anchor Builders ADU Proposal Generator"
git remote add origin https://github.com/john-doe/anchor-builders-adu-generator.git
git branch -M main
git push -u origin main
```

## What happens next:
1. Your code will be pushed to GitHub
2. You can then connect Railway to this GitHub repository
3. Railway will automatically deploy when you push changes to main branch

## Files included in your repository:
- Complete React + TypeScript app
- Railway deployment configuration
- Environment variables template
- Deployment scripts and documentation
- Professional README and setup guides