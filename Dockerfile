# syntax=docker/dockerfile:1

# Build stage — has TypeScript, devDependencies, everything needed to compile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=ca_cert,target=/tmp/ca.pem \
    if [ -f /tmp/ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/ca.pem; fi; npm ci
COPY . .
RUN npm run build

# Runtime stage — only what's needed to actually run the app
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=ca_cert,target=/tmp/ca.pem \
    if [ -f /tmp/ca.pem ]; then export NODE_EXTRA_CA_CERTS=/tmp/ca.pem; fi; npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY public ./public
EXPOSE 3000
CMD ["node", "dist/main.js"]
