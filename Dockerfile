FROM node:18-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 