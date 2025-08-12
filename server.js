import express from 'express';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable gzip compression for better performance
app.use(compression());

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'anchor-builders-adu-generator',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Health check alias
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files from the Vite build output
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true
}));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes and static assets
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/health') ||
      req.path.includes('.')) {
    return next();
  }
  
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Determine port and host
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Explicitly bind to all interfaces for Railway

// Start server with explicit host binding
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Anchor Builders ADU Generator server running on http://${HOST}:${PORT}`);
  console.log(`📁 Serving static files from: ${distPath}`);
  console.log(`🏥 Health check available at: http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;