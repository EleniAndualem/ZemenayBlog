import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthUser(request)
    const { slug } = await params

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        analytics: {
          select: {
            viewsCount: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has liked this post
    let isLiked = false
    if (user) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user.id,
            postId: post.id
          }
        }
      })
      isLiked = !!like
    }

    // Calculate total views from real analytics data
    const totalViews = post.analytics.reduce((sum, analytic) => sum + analytic.viewsCount, 0)

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        thumbnail: post.thumbnail,
        publishedAt: post.publishedAt?.toISOString(),
        author: post.author,
        category: post.category,
        tags: post.tags,
        _count: post._count,
        totalViews,
        isLiked
      }
    })
  } catch (error) {
    console.error("Post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
