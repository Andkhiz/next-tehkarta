module.exports = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Чистый JS-импорт системной переменной Docker Compose
    url: process.env.DATABASE_URL,
  },
};
