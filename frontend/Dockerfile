# First stage: Build React app
FROM node:20.11.1 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the entire app and build
COPY . .
RUN npm run build

# Second stage: Use Nginx for serving the built app
FROM nginx:1.26.2

# Set working directory inside Nginx container
WORKDIR /usr/share/nginx/html

# Copy built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy entrypoint script and set correct permissions
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Copy env template (without overwriting it later)
COPY env.js.template /usr/share/nginx/html/env.js

RUN ls -al

# Set entrypoint script
# ENTRYPOINT ["/usr/share/nginx/html/docker-entrypoint.sh"]

# Expose port 80 (Nginx default)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
