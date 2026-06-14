// web/prisma.config.ts
import "dotenv/config"; // Обязательно для чтения переменных из .env в Node.js
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Явно указываем, откуда брать строку подключения
    url: process.env.DATABASE_URL, 
  },
});
