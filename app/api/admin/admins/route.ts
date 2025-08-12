import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    // Only superadmin can view admins
    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // Build where clause
    const where: any = {
      role: {
        name: {
          in: ["admin", "superadmin"],
        },
      },
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const admins = await prisma.user.findMany({
      where,
      include: {
        role: true,
        createdBy: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      profileImage: admin.profileImage ? Buffer.from(admin.profileImage as unknown as Uint8Array).toString('base64') : null,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
      createdBy: admin.createdBy,
      stats: {
        posts: admin._count.posts,
        comments: admin._count.comments,
      },
    }))

    return NextResponse.json({
      admins: formattedAdmins,
    })
  } catch (error) {
    console.error("Admins API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
