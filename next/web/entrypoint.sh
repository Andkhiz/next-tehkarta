#!/bin/sh

# Ожидаем, пока PostgreSQL начнет принимать соединения
echo "Waiting for PostgreSQL to start..."
while ! nc -z postgres_db 5432; do
  sleep 1
done
echo "PostgreSQL is up and running!"

# Применяем готовые миграции из папки prisma/migrations.
# Эта команда БЕЗОПАСНА: она только докатывает новые SQL-файлы и никогда не затирает существующие таблицы.
echo "Applying database migrations..."
npx prisma migrate deploy --url="postgresql://myuser:mysecretpassword@postgres_db:5432/my_next_db?schema=public"

# Запускаем сервер Next.js (в standalone-режиме)
echo "Starting Next.js application..."
exec node server.js
