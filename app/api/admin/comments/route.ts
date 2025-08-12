import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const limit = 10
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { author: { fullName: { contains: search, mode: "insensitive" } } },
        { author: { email: { contains: search, mode: "insensitive" } } },
        { post: { title: { contains: search, mode: "insensitive" } } }
      ]
    }

    // Get comments with pagination
    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: offset,
        take: limit
      }),
      prisma.comment.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      comments: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        post: comment.post,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      })),
      totalPages,
      currentPage: page,
      totalCount
    })
  } catch (error) {
    console.error("Comments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 