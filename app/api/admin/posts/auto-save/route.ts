import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, excerpt, categoryId, tags } = await request.json()

    // For now, just return success - in a real app, you'd save to a drafts table
    // This is a simplified auto-save that just validates the data
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Auto-saved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auto-save error:", error)
    return NextResponse.json({ error: "Auto-save failed" }, { status: 500 })
  }
}
