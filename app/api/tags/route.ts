import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: "published",
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          posts: {
            _count: "desc",
          },
        },
        { name: "asc" },
      ],
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Tags API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, description } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Check if tag with this slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    })

    if (existingTag) {
      return NextResponse.json({ error: "Tag with this slug already exists" }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        description,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}
