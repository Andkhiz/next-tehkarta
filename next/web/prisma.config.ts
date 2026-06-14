import { defineConfig } from '@prisma/config';

// Считываем строку подключения напрямую из переменной окружения
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Если переменная пустая (например, при сборке), 
    // подставляем заглушку, чтобы валидатор Prisma не выдавал ошибку
    url: databaseUrl || "postgresql://mock:mock@localhost:5432/mock",
  },
});
