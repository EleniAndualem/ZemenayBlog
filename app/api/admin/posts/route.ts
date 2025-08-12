import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, logAdminAction, canManageAllPosts } from "@/lib/auth"
import { generateSlug, generateExcerpt } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const skip = (page - 1) * limit

    // Build where clause based on role
    const where: any = canManageAllPosts(user.role.name) ? {} : { authorId: user.id }

    if (status && ["draft", "published", "archived"].includes(status)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          analytics: {
            select: {
              viewsCount: true,
            },
            orderBy: {
              date: "desc",
            },
            take: 30,
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    const postsWithViews = posts.map((post) => ({
      ...post,
      totalViews: post.analytics.reduce((sum, analytic) => sum + analytic.viewsCount, 0),
      views: post.analytics.reduce((sum, analytic) => sum + analytic.viewsCount, 0),
      author: { username: post.author.fullName },
    }))

    return NextResponse.json({
      posts: postsWithViews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Admin posts API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, excerpt, thumbnail, status, categoryId, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    if (title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 })
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ error: "Content must be at least 10 characters" }, { status: 400 })
    }

    const slug = generateSlug(title)
    const finalExcerpt = excerpt || generateExcerpt(content)

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    })

    if (existingPost) {
      return NextResponse.json({ error: "A post with this title already exists" }, { status: 409 })
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: finalExcerpt,
        thumbnail: thumbnail ? Buffer.from(thumbnail, "base64") : null,
        status: status || "draft",
        authorId: user.id,
        categoryId: categoryId || null,
        publishedAt: status === "published" ? new Date() : null,
      },
      include: {
        author: {
          select: {
            fullName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagConnections = tags.map((tagId: number) => ({
        postId: post.id,
        tagId,
      }))

      await prisma.postTag.createMany({
        data: tagConnections,
      })
    }

    // Log admin action
    await logAdminAction(user.id, `Created post: ${title}`, "posts", post.id, {
      title,
      status,
      publishedAt: post.publishedAt?.toISOString(),
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
