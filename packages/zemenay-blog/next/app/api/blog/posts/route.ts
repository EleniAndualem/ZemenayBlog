import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { id: true, title: true, slug: true, publishedAt: true }
  })
  return NextResponse.json({ posts })
}

