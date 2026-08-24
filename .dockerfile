FROM node:24-slim AS deps

WORKDIR /team4-frontend

COPY package*.json ./
RUN npm ci --ignore-scripts

FROM deps AS build

COPY . .
RUN npm run build \
	&& npm prune --omit=dev

FROM node:24-slim AS runtime

ENV NODE_ENV=production \
	PORT=3000

WORKDIR /team4-frontend

COPY --from=build --chown=node:node /team4-frontend/node_modules ./node_modules
COPY --from=build --chown=node:node /team4-frontend/dist ./dist
COPY --from=build --chown=node:node /team4-frontend/public ./public

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]