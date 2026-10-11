# Multi-stage production Dockerfile for grocery-list-app-api
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package.json tsconfig.json ./

# Install dependencies (works cleanly without requiring existing package-lock.json)
RUN npm install

# Copy source code and build TypeScript
COPY src ./src
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Expose default HTTP port
EXPOSE 8080

# Run Express server listening on 0.0.0.0 and $PORT
CMD ["node", "dist/server.js"]
