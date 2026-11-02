#!/bin/sh
set -eu

port="${PORT:-10000}"

if [ "$port" != "10000" ]; then
    sed -i "s/Listen 10000/Listen ${port}/" /etc/apache2/ports.conf
    sed -i "s/<VirtualHost \\*:10000>/<VirtualHost *:${port}>/" \
        /etc/apache2/sites-available/000-default.conf
fi

if [ -n "${TRACKED_INITIAL_ADMIN_NAME:-}" ] \
    || [ -n "${TRACKED_INITIAL_ADMIN_EMAIL:-}" ] \
    || [ -n "${TRACKED_INITIAL_ADMIN_PASSWORD:-}" ]; then
    php artisan db:seed --class=InitialAdminSeeder --force
fi

exec "$@"
