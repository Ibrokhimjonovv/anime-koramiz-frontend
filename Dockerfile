# Use official Node.js image as the base
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files and pnpm lockfile
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install 

# Copy the rest of the app source code
COPY . .

# Build the Next.js app
RUN pnpm build

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["pnpm", "start"]