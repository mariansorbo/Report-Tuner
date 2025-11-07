# Multi-stage build para optimizar el tamaño de la imagen
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Variables de entorno de build para Vite (se pueden pasar con --build-arg)
ARG VITE_AZURE_ACCOUNT_NAME
ARG VITE_AZURE_SAS_TOKEN
ARG VITE_CONTAINER_NAME
ARG VITE_APP_NAME
ARG VITE_MAX_FILE_SIZE

# Establecer las variables de entorno para el build de Vite
ENV VITE_AZURE_ACCOUNT_NAME=$VITE_AZURE_ACCOUNT_NAME
ENV VITE_AZURE_SAS_TOKEN=$VITE_AZURE_SAS_TOKEN
ENV VITE_CONTAINER_NAME=$VITE_CONTAINER_NAME
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_MAX_FILE_SIZE=$VITE_MAX_FILE_SIZE

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
