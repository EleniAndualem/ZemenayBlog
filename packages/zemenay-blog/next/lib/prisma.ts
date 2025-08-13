import { PrismaClient } from '../../prisma/generated/client'

// Dedicated DB: use BLOG_DATABASE_URL if provided; otherwise fallback to DATABASE_URL
const databaseUrl = process.env.BLOG_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  // Soft warning for build/runtime; consumers must set BLOG_DATABASE_URL or DATABASE_URL
  console.warn('[zemenay-blog] Missing BLOG_DATABASE_URL/DATABASE_URL env var')
}

declare global {
  // eslint-disable-next-line no-var
  var prismaForZemenayBlog: PrismaClient | undefined
}

export const prisma: PrismaClient =
  global.prismaForZemenayBlog ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prismaForZemenayBlog = prisma

