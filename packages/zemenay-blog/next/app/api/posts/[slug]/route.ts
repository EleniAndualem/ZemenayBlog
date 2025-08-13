import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from 'zemenay-blog/next/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, fullName: true, profileImage: true } },
        category: { select: { id: true, name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        images: { select: { imageData: true } },
        _count: { select: { likes: true, comments: true } },
        analytics: { select: { viewsCount: true } },
      },
    })

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const totalViews = post.analytics.reduce((sum, analytic) => sum + analytic.viewsCount, 0)
    const imagesBase64 = post.images.map((img) => Buffer.from(img.imageData as unknown as Uint8Array).toString('base64'))

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        readingTime: post.readingTime ?? null,
        thumbnail: post.thumbnail,
        images: imagesBase64,
        publishedAt: post.publishedAt?.toISOString(),
        author: post.author,
        category: post.category,
        tags: post.tags,
        _count: post._count,
        totalViews,
      },
    })
  } catch (error) {
    console.error('[zemenay-blog] Post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


