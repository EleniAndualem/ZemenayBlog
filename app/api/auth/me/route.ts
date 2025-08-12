import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileImageBase64 = user.profileImage
      ? Buffer.from(user.profileImage as unknown as Uint8Array).toString('base64')
      : null

    return NextResponse.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileImage: profileImageBase64,
      darkMode: user.darkMode,
    })
  } catch (error) {
    console.error("Me API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
