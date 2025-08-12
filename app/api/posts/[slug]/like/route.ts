import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slug = params.slug

    // First get the post by slug
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      }
    })

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: post.id
          }
        }
      })

      return NextResponse.json({ isLiked: false })
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          postId: post.id,
          userId: user.id
        }
      })

      return NextResponse.json({ isLiked: true })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
