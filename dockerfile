# 1. Etapa de construcción de assets front-end
FROM node:18-alpine AS frontend-builder

WORKDIR /app
# Copiamos solo package.json y package-lock.json para aprovechar caché
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# 2. Imagen final con PHP
FROM php:8.2-fpm

# Variables de entorno para producción
ENV APP_ENV=production \
    APP_DEBUG=false \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/html

# Instalamos dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    curl \
    git \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install gd pdo pdo_mysql mbstring zip exif pcntl bcmath opcache \
  && rm -rf /var/lib/apt/lists/*

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copiamos el código de Laravel
COPY backend/ ./

# Copiamos los assets compilados desde la etapa front-end
COPY --from=frontend-builder /app/build public/

# Instalamos dependencias de PHP
RUN composer install --optimize-autoloader --no-dev --no-interaction && \
    php artisan key:generate --ansi

# Ejecutamos migraciones (si lo deseas en build; en producción suele manejarse por CI/CD)
# RUN php artisan migrate --force

# Ajustamos permisos
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html/storage

# Exponemos puerto (php-fpm escucha 9000; luego lo proxeará Nginx)
EXPOSE 9000

# Arrancamos PHP-FPM
CMD ["php-fpm"]
