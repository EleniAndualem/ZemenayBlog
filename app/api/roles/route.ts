import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error("Roles API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
