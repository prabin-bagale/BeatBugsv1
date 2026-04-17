import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient, type Client } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || 'file:./db/custom.db'
  // Ensure file: URLs are properly formatted
  if (url.startsWith('file:')) {
    return url
  }
  return url
}

function createPrismaClient(): PrismaClient {
  const url = createDatabaseUrl()

  if (url.startsWith('libsql://') || url.startsWith('https://')) {
    // Use adapter for Turso / remote libSQL
    const libsql: Client = createClient({ url })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Direct connection for local SQLite (file:)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
