FROM node:18-alpine AS frontend-builder

RUN npm install

RUN npm run build

# Define the base image
FROM php:8.2-fpm

# Set working directory inside the container
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    curl \
    git \
    libonig-dev \
    libxml2-dev \
    libzip-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql mbstring zip exif pcntl bcmath opcache

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Clone Laravel project from GitHub
RUN git clone https://github.com/miusarname2/laravel-test-CRUD.git /var/www/html

# Rename .env.example to .env
RUN mv .env.example .env

# Install Laravel dependencies
RUN composer install --optimize-autoloader --no-dev

#Build react 
RUN npm run build

# Generate application key
RUN php artisan key:generate

# Run Laravel migrations
RUN php artisan migrate

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# Expose port 8000 and start php-fpm server
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]