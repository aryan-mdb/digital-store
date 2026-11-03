#!/usr/bin/env bash
set -e

cd /var/www/html

PORT="${PORT:-80}"
sed -ri "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/:80>/:${PORT}>/" /etc/apache2/sites-available/000-default.conf

if [ ! -f .env ]; then
    cp .env.example .env
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link || true

# Seeding runs as root and the private disk creates 0700 folders, so hand
# storage back to Apache's user or product files look missing to downloads.
chown -R www-data:www-data storage bootstrap/cache

exec apache2-foreground
