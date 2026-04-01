FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG PUBLIC_URL=/
ENV PUBLIC_URL=$PUBLIC_URL
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
