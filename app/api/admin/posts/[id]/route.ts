import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, logAdminAction } from "@/lib/auth"
import { generateSlug, generateExcerpt } from "@/lib/utils"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(_request)
    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        images: { select: { id: true, imageData: true } },
      },
    })

    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const thumbnailBase64 = post.thumbnail ? `data:image/*;base64,${Buffer.from(post.thumbnail).toString("base64")}` : null
    const images = post.images.map((img) => `data:image/*;base64,${Buffer.from(img.imageData).toString("base64")}`)

    return NextResponse.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      categoryId: post.categoryId,
      readingTime: post.readingTime ?? null,
      thumbnailBase64,
      images,
      tagIds: post.tags.map((t) => t.tagId),
    })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request)
    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const {
      title,
      content,
      excerpt,
      status,
      categoryId,
      readingTime,
      tags,
      thumbnail, // base64 string or null to clear
      images, // array of base64 strings to replace existing images
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const slug = generateSlug(title)
    const finalExcerpt = excerpt || generateExcerpt(content)

    // Update core fields
    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: finalExcerpt,
        status: status || "draft",
        categoryId,
        readingTime: typeof readingTime === "number" ? readingTime : null,
        publishedAt: status === "published" ? new Date() : null,
        thumbnail: thumbnail === null ? null : typeof thumbnail === "string" && thumbnail.length > 0 ? Buffer.from(thumbnail, "base64") : undefined,
      },
    })

    // Replace tags
    if (Array.isArray(tags)) {
      await prisma.postTag.deleteMany({ where: { postId: id } })
      if (tags.length > 0) {
        await prisma.postTag.createMany({ data: tags.map((tagId: number) => ({ postId: id, tagId })) })
      }
    }

    // Replace images
    if (Array.isArray(images)) {
      await prisma.postImage.deleteMany({ where: { postId: id } })
      const imageRows = images
        .filter((b64: unknown) => typeof b64 === "string" && (b64 as string).length > 0)
        .map((b64: string) => ({ postId: id, imageData: Buffer.from(b64, "base64") }))
      if (imageRows.length > 0) {
        await prisma.postImage.createMany({ data: imageRows })
      }
    }

    await logAdminAction(user.id, `Updated post: ${updated.title}`, "posts", updated.id, {
      status: updated.status,
      publishedAt: updated.publishedAt?.toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


