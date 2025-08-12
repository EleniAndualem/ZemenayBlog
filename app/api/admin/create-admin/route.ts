import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hashPassword, logAdminAction } from "@/lib/auth"
import { validateEmail, validatePassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    // Only superadmin can create admins
    if (!user || user.role.name !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, fullName, password, role = "admin" } = await request.json()

    // Validation
    if (!email || !fullName || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 })
    }

    // Validate role
    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Get the selected role
    const selectedRole = await prisma.role.findFirst({
      where: { name: role },
    })

    if (!selectedRole) {
      return NextResponse.json({ error: `${role} role not found` }, { status: 500 })
    }

    // Hash password and create admin/superadmin
    const hashedPassword = await hashPassword(password)

    const newAdmin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        fullName: fullName.trim(),
        passwordHash: hashedPassword,
        roleId: selectedRole.id,
        darkMode: false,
        createdById: user.id,
      },
      include: {
        role: true,
      },
    })

    // Log admin creation
    await logAdminAction(user.id, `Created ${role}`, "users", newAdmin.id, {
      adminEmail: newAdmin.email,
      adminName: newAdmin.fullName,
      role: role,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt.toISOString(),
        updatedAt: newAdmin.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
