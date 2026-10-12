#!/usr/bin/env bash
# Runs ON the Hostinger server: pulls the latest code and updates the API.
# Usage (via SSH):  bash ~/payan/repo/deploy/hostinger/server-deploy.sh
set -euo pipefail

cd ~/payan/repo
git pull --ff-only

cd backend
# --no-scripts: Hostinger disables proc_open, which Composer scripts need.
composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
php artisan package:discover
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

cp ~/payan/repo/deploy/hostinger/laravel.php ~/domains/payanfoods.com/public_html/laravel.php
cp ~/payan/repo/deploy/hostinger/.htaccess ~/domains/payanfoods.com/public_html/.htaccess

echo "API deployed."
