# 1) Build del frontend con Node
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Clona el repo (asume front+back juntos)
RUN git clone https://github.com/miusarname2/laravel-test-CRUD.git ./

# Instala y build de React
RUN npm ci
RUN npm run build

# 2) Imagen de PHP / Laravel
FROM php:8.2-fpm
WORKDIR /var/www/html

# Dependencias del sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip curl git \
    libonig-dev libxml2-dev libzip-dev \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install gd pdo pdo_mysql mbstring zip exif pcntl bcmath opcache

# Composer
RUN curl -sS https://getcomposer.org/installer | php \
  -- --install-dir=/usr/local/bin --filename=composer

# Copia los archivos de Laravel (ya estaban en Git en el stage builder)
# y los assets estáticos del build de React
COPY --from=frontend-builder /var/www/html /var/www/html
COPY --from=frontend-builder /app/build /var/www/html/public

# Instala dependencias de Laravel, genera key y migra
RUN composer install --optimize-autoloader --no-dev \
  && php artisan key:generate \
  && php artisan migrate

# Permisos y arranque
RUN chown -R www-data:www-data /var/www/html \
  && chmod -R 755 /var/www/html/storage

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
