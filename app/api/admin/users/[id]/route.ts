import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, logAdminAction } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    // Only superadmin can update other users
    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { roleId, darkMode } = await request.json()

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent superadmin from demoting themselves
    if (targetUser.id === user.id && roleId && roleId !== targetUser.roleId) {
      const newRole = await prisma.role.findUnique({ where: { id: roleId } })
      if (newRole?.name !== "superadmin") {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (roleId && roleId !== targetUser.roleId) {
      updateData.roleId = roleId
    }
    if (typeof darkMode === "boolean" && darkMode !== targetUser.darkMode) {
      updateData.darkMode = darkMode
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes to update" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    })

    // Log the action
    await logAdminAction(user.id, `Updated user: ${targetUser.fullName}`, "users", id, {
      changes: updateData,
      targetUser: targetUser.email,
    })

    return NextResponse.json({
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      darkMode: updatedUser.darkMode,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(request)

    // Only superadmin can delete users
    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent superadmin from deleting themselves
    if (targetUser.id === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Prevent deleting other superadmins
    if (targetUser.role.name === "superadmin") {
      return NextResponse.json({ error: "Cannot delete other superadmins" }, { status: 400 })
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    })

    // Log the action
    await logAdminAction(user.id, `Deleted user: ${targetUser.fullName}`, "users", id, {
      deletedUser: {
        email: targetUser.email,
        role: targetUser.role.name,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
