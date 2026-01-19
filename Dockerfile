FROM node:22-alpine AS base
ENV NODE_ENV=production
WORKDIR /usr/app
COPY ./package.json ./postinstall.js ./
RUN npm install --omit=dev \
    && npm cache clean --force

# Dev container
FROM base AS dev
COPY ./index.html ./
ENV NODE_ENV=development
RUN npm install
CMD ["npm", "run", "dev", "--", "--host"]

# Compile typescript sources
FROM dev AS build
COPY . .
RUN npm run build

# FROM nginx:1.25-alpine as final
# COPY --from=build /app/dist /usr/share/nginx/html
