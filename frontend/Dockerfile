# שלב ראשון: בניית ה-React
FROM node:20.11.1 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# שלב שני: Nginx
FROM nginx:1.26.2

# העתקת האפליקציה המובנית
COPY --from=build /app/build /usr/share/nginx/html
RUN chmod -R 777 /usr/share/nginx/

# העתקת קובץ תבנית ה-env
COPY env.js.template /usr/share/nginx/html/env.js.template

# העתקת קובץ ה-entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT [ "/docker-entrypoint.sh" ]

# חשיפת הפורט
EXPOSE 3000

# הפעלת Nginx
CMD ["nginx", "-g", "daemon off;"]
