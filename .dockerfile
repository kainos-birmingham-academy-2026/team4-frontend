FROM node:24-alpine

WORKDIR /team4-frontend

# Copy package files
COPY package*.json ./

# Install dependencies (skip prepare script that installs git hooks)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (adjust if needed)
EXPOSE 3000

# Start application
CMD ["npm", "start"]