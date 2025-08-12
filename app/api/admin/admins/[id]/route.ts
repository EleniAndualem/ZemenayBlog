import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, logAdminAction } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    // Only superadmin can delete admins
    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Find the target admin
    const targetAdmin = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!targetAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    // Prevent superadmin from deleting themselves
    if (targetAdmin.id === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Prevent deleting other superadmins
    if (targetAdmin.role.name === "superadmin") {
      return NextResponse.json({ error: "Cannot delete other superadmins" }, { status: 400 })
    }

    // Only allow deleting admins
    if (!["admin", "superadmin"].includes(targetAdmin.role.name)) {
      return NextResponse.json({ error: "Can only delete admin accounts" }, { status: 400 })
    }

    // Delete the admin (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    })

    // Log the action
    await logAdminAction(user.id, `Deleted admin: ${targetAdmin.fullName}`, "users", id, {
      deletedAdmin: {
        email: targetAdmin.email,
        role: targetAdmin.role.name,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
