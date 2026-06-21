FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS production

# Install ghostscript for PDF compression
RUN apk add --no-cache ghostscript

WORKDIR /app
COPY --from=build /app/build /app
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
ENV GS_PATH=gs
# Use /app/tmp for persistent sqlite storage in docker
ENV TMP_DIR=/app/tmp

EXPOSE 3333

# Start the AdonisJS server
CMD ["node", "bin/server.js"]
