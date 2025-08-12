import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hashPassword, logAdminAction } from "@/lib/auth"
import { validateEmail } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const profileImage = formData.get("profileImage") as File

    const updateData: any = {}

    // Validate and update full name
    if (fullName && fullName.trim() !== user.fullName) {
      if (fullName.trim().length < 2) {
        return NextResponse.json({ error: "Full name must be at least 2 characters" }, { status: 400 })
      }
      updateData.fullName = fullName.trim()
    }

    // Validate and update email
    if (email && email.toLowerCase() !== user.email) {
      if (!validateEmail(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 409 })
      }

      updateData.email = email.toLowerCase()
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set new password" }, { status: 400 })
      }

      const bcrypt = await import("bcryptjs")
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)

      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })
      }

      updateData.passwordHash = await hashPassword(newPassword)
    }

    // Handle profile image
    if (profileImage && profileImage.size > 0) {
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Profile image must be less than 5MB" }, { status: 400 })
      }

      if (!profileImage.type.startsWith("image/")) {
        return NextResponse.json({ error: "Profile image must be a valid image file" }, { status: 400 })
      }

      const imageBuffer = Buffer.from(await profileImage.arrayBuffer())
      updateData.profileImage = imageBuffer
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        role: true,
      },
    })

    // Log the profile update
    await logAdminAction(user.id, "Updated profile", "users", user.id, {
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    })

    const profileImageBase64 = updatedUser.profileImage
      ? Buffer.from(updatedUser.profileImage as unknown as Uint8Array).toString('base64')
      : null

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      profileImage: profileImageBase64,
      darkMode: updatedUser.darkMode,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
