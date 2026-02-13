# Build Stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Permet d'ignorer les petits conflits de version (19.2.17 vs 19.2.18)
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Serve Stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Copie d'une config nginx personnalisée si nécessaire pour gérer le routage Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80