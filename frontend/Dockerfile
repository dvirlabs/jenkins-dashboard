FROM node:20.11.1 AS build

WORKDIR /app

COPY package.json ./ 
COPY package-lock.json ./ 

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Second stage: nginx image
FROM nginx:1.26.2

# Install ping tool in the nginx container
# RUN apt-get update && apt-get install -y iputils-ping

# Copy the built frontend app into the nginx container
COPY --from=build /app/build /usr/share/nginx/html
RUN chmod -R 777 /usr/share/nginx/


# Expose port 3000 (for development purposes)
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

