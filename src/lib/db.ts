import { PrismaClient } from '@prisma/client'
import { mkdirSync } from 'fs'
import { join } from 'path'

// Ensure db directory exists (needed for fresh deployments)
try {
  const dbDir = process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).pathname.replace(/\/[^/]*$/, '')
    : join(process.cwd(), 'db')
  mkdirSync(dbDir, { recursive: true })
} catch {}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db