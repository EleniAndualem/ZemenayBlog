import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from 'zemenay-blog/next/lib/prisma'
import { getBlogAuth } from 'zemenay-blog/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const comments = await prisma.comment.findMany({
      where: { postId: post.id, parentId: null },
      include: {
        author: { select: { id: true, fullName: true, profileImage: true } },
        replies: {
          include: { author: { select: { id: true, fullName: true, profileImage: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        author: c.author,
        replies: c.replies.map((r) => ({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt.toISOString(),
          author: r.author,
        })),
      })),
    })
  } catch (error) {
    console.error('[zemenay-blog] Comments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = getBlogAuth()
    const userId = await auth.getCurrentUserId(request as unknown as Request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = params
    const { content } = await request.json()
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId: post.id, authorId: Number(userId) },
      include: { author: { select: { id: true, fullName: true, profileImage: true } } },
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
      },
    })
  } catch (error) {
    console.error('[zemenay-blog] Comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


