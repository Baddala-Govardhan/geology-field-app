#FROM node:18 AS build
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build


#FROM nginx:alpine
#COPY --from=build /app/build /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]


FROM node:18 AS builder
WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the app source and build
COPY . .
RUN npm run build

FROM nginx:alpine

# Serve the app at the root path (/)
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
