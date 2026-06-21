FROM node:18-bullseye-slim

# Install Ghostscript
RUN apt-get update && apt-get install -y ghostscript && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
