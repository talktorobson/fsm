# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY web/package*.json ./
RUN npm ci
COPY web/ .
# Environment variables for the build (if needed)
# ENV VITE_API_URL=/api
RUN npm run build

# Run Stage
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
