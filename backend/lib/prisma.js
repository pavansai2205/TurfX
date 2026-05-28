import { PrismaClient } from '@prisma/client';

// Using Node's global object as globalThis to preserve connection pools during hot-reloads
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
