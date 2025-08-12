import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find the post
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, status: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only track views for published posts
    if (post.status !== "published") {
      return NextResponse.json({ error: "Post not published" }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Upsert the analytics record for today
    await prisma.postAnalytic.upsert({
      where: {
        postId_date: {
          postId: post.id,
          date: today
        }
      },
      update: {
        viewsCount: {
          increment: 1
        }
      },
      create: {
        postId: post.id,
        date: today,
        viewsCount: 1,
        likesCount: 0,
        commentsCount: 0
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking view:", error)
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
