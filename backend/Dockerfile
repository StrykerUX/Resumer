# Dockerfile para CV Resumer - DokPloy
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del root y backend
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Instalar dependencias
RUN npm run install-all

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Desplegar base de datos
RUN cd backend && npm run db:deploy

# Exponer puerto
EXPOSE 3001

# Comando por defecto - USAR SCRIPT DE PRODUCCIÓN
CMD ["node", "start-production.js"]