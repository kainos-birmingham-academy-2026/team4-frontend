FROM node:24-slim

# Ensure proper SSL/TLS support for production-ready environment.
RUN apt-get update -y \
	&& apt-get install -y openssl ca-certificates \
	&& update-ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /team4-frontend

# Copy package files
COPY package*.json ./

# Install dependencies (skip repository hook scripts in containers).
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

RUN chmod +x /team4-frontend/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/team4-frontend/entrypoint.sh"]