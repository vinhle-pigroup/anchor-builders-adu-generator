# Use official Node.js runtime as the base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy server file
COPY server.js ./

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to app user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { \
    console.log('Health check status:', res.statusCode); \
    process.exit(res.statusCode === 200 ? 0 : 1); \
  }).on('error', (err) => { \
    console.error('Health check failed:', err.message); \
    process.exit(1); \
  })"

# Start the application
CMD ["npm", "run", "start:production"]