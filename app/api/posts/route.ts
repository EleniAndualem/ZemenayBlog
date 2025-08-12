import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Cache configuration
const CACHE_DURATION = 60 * 5 // 5 minutes in seconds

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || []
    const sortBy = searchParams.get("sortBy") || "newest"

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "published",
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tags,
            },
          },
        },
      }
    }

    // Build orderBy clause
    let orderBy: any = { publishedAt: "desc" }

    switch (sortBy) {
      case "oldest":
        orderBy = { publishedAt: "asc" }
        break
      case "popular":
        // Sort by total views (fallback to newest if not available)
        orderBy = { publishedAt: "desc" }
        break
      case "liked":
        orderBy = { likes: { _count: "desc" } }
        break
      case "commented":
        orderBy = { comments: { _count: "desc" } }
        break
      default:
        orderBy = { publishedAt: "desc" }
    }

    // Get posts with counts and analytics
    const [rawPosts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          analytics: {
            select: {
              viewsCount: true,
            },
          },
          // readingTime fetched directly from post
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ])

    // Format posts: convert binary to base64 and compute totalViews
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
        author: {
          ...post.author,
          profileImage: authorImageBase64,
        },
        totalViews,
      }
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    })

    // Add cache headers
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
    )
    response.headers.set("CDN-Cache-Control", `public, max-age=${CACHE_DURATION}`)
    response.headers.set("Vercel-CDN-Cache-Control", `public, max-age=${CACHE_DURATION}`)

    return response
  } catch (error) {
    console.error("Posts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, categoryId, tagIds, featuredImage, status = "DRAFT" } = body

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json({ error: "A post with this title already exists" }, { status: 400 })
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        authorId: 1, // This should come from authentication
        categoryId: categoryId || null,
        tags: tagIds
          ? {
              connect: tagIds.map((id: number) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
        category: true,
        tags: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
