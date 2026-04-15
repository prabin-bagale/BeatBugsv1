import { PrismaClient } from '@prisma/client'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'

// Ensure database directory exists (for fresh deployments / serverless)
function ensureDbDir() {
  try {
    const dbUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
    const url = new URL(dbUrl)
    const dbPath = url.pathname
    const dbDir = dirname(dbPath.startsWith('/') ? dbPath : join(process.cwd(), dbPath))
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }
  } catch {}
}
ensureDbDir()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
