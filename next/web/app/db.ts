// web/app/db.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Создаем пул соединений через стандартный драйвер PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Оборачиваем его в официальный адаптер Prisma 7
const adapter = new PrismaPg(pool)

// Передаем адаптер в конструктор клиента
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
