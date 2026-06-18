#!/bin/sh

# Ожидаем, пока PostgreSQL начнет принимать соединения
echo "Waiting for PostgreSQL to start..."
while ! nc -z postgres_db 5432; do
  sleep 1
done
echo "PostgreSQL is up and running!"

# ХАК: Если файл конфигурации существует, временно переименовываем его.
# Это заставит Prisma забыть про капризный .ts файл и читать чистый DATABASE_URL
if [ -f "prisma.config.ts" ]; then
  mv prisma.config.ts prisma.config.ts.bak
fi

echo "Applying database migrations..."
# Теперь инлайн-переменная применится со 100% гарантией!
DATABASE_URL="postgresql://myuser:mysecretpassword@postgres_db:5432/my_next_db?schema=public" npx prisma migrate deploy

# Возвращаем файл конфигурации на место, чтобы Next.js работал корректно
if [ -f "prisma.config.ts.bak" ]; then
  mv prisma.config.ts.bak prisma.config.ts
fi

# Запускаем сервер Next.js
echo "Starting Next.js application..."
exec node server.js
