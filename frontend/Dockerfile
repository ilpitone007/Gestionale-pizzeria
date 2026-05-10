# Fase di build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Passa l'URL dell'API per Nginx
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Fase di produzione con Nginx
FROM nginx:alpine

# Copia i file buildati
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configurazione Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]