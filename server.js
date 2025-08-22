import express from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Readable } from 'node:stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Enable gzip compression for better performance
app.use(compression());

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Configure Helmet with security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-inline'"] : [])
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline styles
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.googleusercontent.com"
      ],
      connectSrc: [
        "'self'",
        "https://login.microsoftonline.com", // MSAL authentication
        "https://graph.microsoft.com" // Optional: Graph API if needed
      ],
      frameSrc: [
        "'self'",
        "https://login.microsoftonline.com" // MSAL popup/redirect
      ],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Configure CORS - simplified for internal app
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.API_TRUSTED_ORIGIN || false)
    : ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  maxAge: 600
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development'
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limit for PDF generation
const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 PDF generations per 15 minutes
  message: 'PDF generation rate limit exceeded. Please try again later.',
  skip: () => process.env.NODE_ENV === 'development'
});

// PDF Generation Proxy Endpoint (protects API key)
app.post('/api/generate-pdf', pdfLimiter, async (req, res) => {
  try {
    // Get PDF service URL from environment
    const pdfServiceUrl = process.env.PDF_SERVICE_URL || 'https://anchor-pdf-service-production.up.railway.app';
    const apiKey = process.env.PDF_SERVICE_API_KEY;
    
    if (!apiKey) {
      console.error('PDF_SERVICE_API_KEY not configured');
      return res.status(500).json({ 
        error: 'PDF service not configured',
        details: 'Server configuration error'
      });
    }
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Use native fetch with correct upstream endpoint
      const response = await fetch(`${pdfServiceUrl}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(req.body),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        const error = await response.text().catch(() => 'Unknown error');
        console.error('PDF service error:', response.status, error);
        return res.status(response.status).json({ 
          error: 'PDF generation failed',
          details: error.slice(0, 500) // Limit error message size
        });
      }
      
      // Get response headers
      const contentType = response.headers.get('content-type') || 'application/pdf';
      const contentLength = response.headers.get('content-length');
      const length = contentLength ? parseInt(contentLength, 10) : undefined;
      
      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'attachment; filename="proposal.pdf"');
      res.setHeader('Cache-Control', 'no-store'); // Don't cache sensitive PDFs
      if (length) res.setHeader('Content-Length', String(length));
      
      // Buffer small files, stream large ones
      const BIG_FILE_SIZE = 10 * 1024 * 1024; // 10MB threshold
      
      if (!length || length <= BIG_FILE_SIZE) {
        // Buffer small PDFs (simpler and fine for internal app)
        const buffer = Buffer.from(await response.arrayBuffer());
        return res.send(buffer);
      } else {
        // Stream large PDFs to avoid memory issues
        return Readable.fromWeb(response.body).pipe(res);
      }
      
    } finally {
      clearTimeout(timeout);
    }
    
  } catch (error) {
    // Handle timeout and other errors
    if (error.name === 'AbortError') {
      console.error('PDF generation timeout after 30 seconds');
      return res.status(504).json({ 
        error: 'PDF generation timeout',
        details: 'Request took too long to complete'
      });
    }
    
    console.error('PDF proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' 
        ? (error?.message || String(error)).slice(0, 500)
        : 'An error occurred'
    });
  }
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'anchor-builders-adu-generator',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimit: 'active',
      trustProxy: app.get('trust proxy'),
      apiKeyConfigured: !!process.env.PDF_SERVICE_API_KEY
    }
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