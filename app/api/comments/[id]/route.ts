import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, canModerateComments } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check permissions - user can edit their own comments, admins can moderate comments on their posts
    const canEdit = comment.authorId === user.id || canModerateComments(user.role.name, comment.post.authorId, user.id)

    if (!canEdit) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("Update comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check permissions
    const canDelete =
      comment.authorId === user.id || canModerateComments(user.role.name, comment.post.authorId, user.id)

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Delete comment and update analytics
    await prisma.$transaction([
      prisma.comment.delete({ where: { id } }),
      prisma.postAnalytic.upsert({
        where: {
          postId_date: {
            postId: comment.post.id,
            date: today,
          },
        },
        update: {
          commentsCount: { decrement: 1 },
        },
        create: {
          postId: comment.post.id,
          date: today,
          viewsCount: 0,
          likesCount: 0,
          commentsCount: 0,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
