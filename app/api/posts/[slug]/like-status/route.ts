import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ isLiked: false })
    }

    const { slug } = params

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug, status: "published" },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user has liked the post
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    })

    return NextResponse.json({ isLiked: !!like })
  } catch (error) {
    console.error("Like status API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
