import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { darkMode } = await request.json()

    await prisma.user.update({
      where: { id: user.id },
      data: { darkMode },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Theme update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
