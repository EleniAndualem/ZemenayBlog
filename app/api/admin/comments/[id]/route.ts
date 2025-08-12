import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, logAdminAction } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const commentId = params.id

    // Get comment details before deletion for logging
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { fullName: true, email: true } },
        post: { select: { title: true } }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId }
    })

    // Log the action
    await logAdminAction(user.id, "Deleted Comment", "comments", commentId, {
      commentContent: comment.content.substring(0, 100),
      authorName: comment.author.fullName,
      authorEmail: comment.author.email,
      postTitle: comment.post.title,
      deletedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 