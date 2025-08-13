import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from 'zemenay-blog/next/lib/prisma'

const CACHE_DURATION = 60 * 5
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit
    const where: any = { status: 'published' }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = { slug: category }
    }
    if (tags.length > 0) {
      where.tags = { some: { tag: { slug: { in: tags } } } }
    }

    let orderBy: any = { publishedAt: 'desc' }
    switch (sortBy) {
      case 'oldest': orderBy = { publishedAt: 'asc' }; break
      case 'popular': orderBy = { publishedAt: 'desc' }; break
      case 'liked': orderBy = { likes: { _count: 'desc' } }; break
      case 'commented': orderBy = { comments: { _count: 'desc' } }; break
      default: orderBy = { publishedAt: 'desc' }
    }

    const [rawPosts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: { select: { id: true, fullName: true, profileImage: true } },
          category: { select: { id: true, name: true, slug: true, color: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
          analytics: { select: { viewsCount: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ])

    const posts = rawPosts.map((post) => {
      const thumbnailBase64 = post.thumbnail
        ? Buffer.from(post.thumbnail as unknown as Uint8Array).toString('base64')
        : null
      const authorImageBase64 = post.author.profileImage
        ? Buffer.from(post.author.profileImage as unknown as Uint8Array).toString('base64')
        : null
      const totalViews = post.analytics.reduce((sum, a) => sum + a.viewsCount, 0)
      return {
        ...post,
        thumbnail: thumbnailBase64,
        readingTime: (post as any).readingTime ?? null,
        author: { ...post.author, profileImage: authorImageBase64 },
        totalViews,
      }
    })

    const totalPages = Math.ceil(totalCount / limit)
    const response = NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`)
    response.headers.set('CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`)
    response.headers.set('Vercel-CDN-Cache-Control', `public, max-age=${CACHE_DURATION}`)
    return response
  } catch (error) {
    console.error('[zemenay-blog] Posts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


