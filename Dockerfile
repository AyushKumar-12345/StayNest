# Multi-stage production Dockerfile for StayNest
# Stage 1: Install production dependencies
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install only production dependencies reproducibly
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Final minimal production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DOCKER_CONTAINER=true

# Copy production node_modules from dependencies stage with correct ownership
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

# Switch to the non-root 'node' user provided by node:alpine
USER node

EXPOSE 8080

# Native Node.js health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 8080) + '/', (res) => { if (res.statusCode < 500) process.exit(0); else process.exit(1); }).on('error', () => process.exit(1));"

# Start the application
CMD ["node", "app.js"]

