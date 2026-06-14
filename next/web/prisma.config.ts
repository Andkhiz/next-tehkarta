import "dotenv/config"; // <--- КРИТИЧЕСКИ ВАЖНАЯ СТРОКА ДЛЯ PRISMA 7 В DOCKER
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Теперь процесс гарантированно увидит DATABASE_URL из окружения
    url: process.env.DATABASE_URL,
  },
});
