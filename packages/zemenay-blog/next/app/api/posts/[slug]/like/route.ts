import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from 'zemenay-blog/next/lib/prisma'
import { getBlogAuth } from 'zemenay-blog/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = getBlogAuth()
    const userId = await auth.getCurrentUserId(request as unknown as Request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const slug = params.slug
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId: Number(userId), postId: post.id } },
    })

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId: Number(userId), postId: post.id } } })
      return NextResponse.json({ isLiked: false })
    }

    await prisma.like.create({ data: { postId: post.id, userId: Number(userId) } })
    return NextResponse.json({ isLiked: true })
  } catch (error) {
    console.error('[zemenay-blog] Like error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


