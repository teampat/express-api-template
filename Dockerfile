# Default Dockerfile (Node.js)
# For Bun version, use: docker build -f Dockerfile.bun .
# For Node.js version, use: docker build -f Dockerfile.nodejs .

FROM node:22-alpine as base

# Set working directory
WORKDIR /app

# Install system dependencies for native modules (sharp, sqlite3, etc.)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Production dependencies
FROM base as deps
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:22-alpine as production

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache vips-dev curl

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Change ownership of the app directory
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]