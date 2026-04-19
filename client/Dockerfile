# =========================================
# Stage 1: Build the React/Vite app
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build
COPY . .
RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginx:alpine

# Copy your custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from 'builder'
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
