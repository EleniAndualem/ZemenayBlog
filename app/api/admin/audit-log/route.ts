import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20
    const offset = (page - 1) * limit

    // Get audit logs with pagination
    const [auditLogs, totalCount] = await Promise.all([
      prisma.adminAuditLog.findMany({
        include: {
          admin: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: offset,
        take: limit
      }),
      prisma.adminAuditLog.count()
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      auditLogs: auditLogs.map(log => ({
        id: log.id,
        admin: log.admin,
        action: log.action,
        targetTable: log.targetTable,
        targetId: log.targetId,
        details: log.details,
        createdAt: log.createdAt.toISOString()
      })),
      totalPages,
      currentPage: page,
      totalCount
    })
  } catch (error) {
    console.error("Audit log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 