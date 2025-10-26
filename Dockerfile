# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port (pxxl.app will override this with their own)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

