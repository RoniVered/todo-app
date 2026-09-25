# Build stage — has TypeScript, devDependencies, everything needed to compile
FROM node:24-alpine AS build
WORKDIR /app
COPY .docker/netspark-ca.pem /tmp/netspark-ca.pem
ENV NODE_EXTRA_CA_CERTS=/tmp/netspark-ca.pem
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage — only what's needed to actually run the app
FROM node:24-alpine
WORKDIR /app
COPY .docker/netspark-ca.pem /tmp/netspark-ca.pem
ENV NODE_EXTRA_CA_CERTS=/tmp/netspark-ca.pem
COPY package*.json ./
RUN npm ci --omit=dev
RUN rm -f /tmp/netspark-ca.pem
ENV NODE_EXTRA_CA_CERTS=
COPY --from=build /app/dist ./dist
COPY public ./public
EXPOSE 3000
CMD ["node", "dist/main.js"]
