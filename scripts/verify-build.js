#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build artifacts...');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html not found. Build may have failed.');
  process.exit(1);
}

// List contents of dist directory
const distContents = fs.readdirSync(distPath);
console.log('📁 dist/ contents:', distContents);

// Check dist size
const stats = fs.statSync(distPath);
console.log('📊 dist/ created:', stats.birthtime.toISOString());

// Verify index.html has content
const indexStats = fs.statSync(indexPath);
console.log('📄 index.html size:', indexStats.size, 'bytes');

if (indexStats.size < 100) {
  console.error('❌ index.html seems too small, build may be incomplete.');
  process.exit(1);
}

console.log('✅ Build verification passed!');
console.log('🚀 Ready to start server with `npm run start:production`');