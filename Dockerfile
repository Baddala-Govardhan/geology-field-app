FROM node:18 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG PUBLIC_URL=/
ENV PUBLIC_URL=$PUBLIC_URL
# Set at build time so the UI shows which deploy is live (e.g. REACT_APP_BUILD_REF=$(git rev-parse --short HEAD))
ARG REACT_APP_BUILD_REF=
ENV REACT_APP_BUILD_REF=$REACT_APP_BUILD_REF
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
