# ─────────────────────────────────────────
# Stage 1: Base PHP
# ─────────────────────────────────────────
FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    git curl zip unzip libpng-dev libxml2-dev \
    postgresql-dev redis oniguruma-dev \
    libzip-dev icu-dev

RUN docker-php-ext-install \
    pdo pdo_pgsql pgsql \
    mbstring exif pcntl bcmath \
    gd zip intl opcache

RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ─────────────────────────────────────────
# Stage 2: Development
# ─────────────────────────────────────────
FROM base AS development

COPY . .
RUN composer install --no-interaction --prefer-dist
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# ─────────────────────────────────────────
# Stage 3: Production
# ─────────────────────────────────────────
FROM base AS production

COPY . .
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
