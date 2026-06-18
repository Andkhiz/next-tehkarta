#!/bin/sh

# Ожидаем, пока PostgreSQL начнет принимать соединения
echo "Waiting for PostgreSQL to start..."
while ! nc -z postgres_db 5432; do
  sleep 1
done
echo "PostgreSQL is up and running!"

# Синхронизируем структуру БД напрямую из файла schema.prisma, используя флаг --url
echo "Pushing schema to the database..."
npx prisma db push --url="postgresql://myuser:mysecretpassword@postgres_db:5432/my_next_db?schema=public"

# Запускаем сервер Next.js
echo "Starting Next.js application..."
# Вместо exec npm run start пишем:
exec node server.js
