FROM node:22-alpine AS base
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json postinstall.js ./
RUN npm install --omit=dev \
    && npm cache clean --force

# Dev container
FROM base AS dev
ENV NODE_ENV=development
RUN npm install
CMD ["node"]

# Compile typescript sources
FROM dev AS build
COPY . .
RUN npm run build

# FROM nginx:1.25-alpine as final
# COPY --from=build /app/dist /usr/share/nginx/html
