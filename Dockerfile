# Multi-stage build for the entire application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd server && npm ci --only=production && npm cache clean --force
RUN cd client && npm ci --only=production && npm cache clean --force

# Build the client
FROM base AS client-builder
WORKDIR /app

# Copy client package files and install all dependencies (including dev)
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy client source code and shared types
COPY client/ ./client/
COPY shared/ ./shared/

# Build client
RUN cd client && npm run build

# Build the server
FROM base AS server-builder
WORKDIR /app

# Copy server package files and install all dependencies (including dev)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy server source code and shared types
COPY server/ ./server/
COPY shared/ ./shared/

# Build server
RUN cd server && npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules

# Copy built applications
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server/dist ./server/dist

# Copy necessary files
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/ ./shared/

# Change ownership to nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server/dist/index.js"]