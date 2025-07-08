# Backend Dockerfile for Render.com
FROM node:18-alpine AS base

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage for building
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code and shared types
COPY src/ ./src/
COPY ../shared/ ./shared/
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port (Render will set PORT environment variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]