import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: string
  email: string
  roleId: number
  roleName: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      role: true,
    },
  })

  return user
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(user.role.name)) {
      return new Response("Forbidden", { status: 403 })
    }

    return user
  }
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetTable: string,
  targetId: string,
  details?: any,
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetTable,
        targetId,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
      },
    })
  } catch (error) {
    console.error("Failed to log admin action:", error)
  }
}

// Permission helpers
export function canManageAllPosts(roleName: string): boolean {
  return roleName === "superadmin"
}

export function canManageOwnPosts(roleName: string): boolean {
  return ["admin", "superadmin"].includes(roleName)
}

export function canCreateAdmins(roleName: string): boolean {
  return roleName === "superadmin"
}

export function canManageUsers(roleName: string): boolean {
  return roleName === "superadmin"
}

export function canViewGlobalAnalytics(roleName: string): boolean {
  return roleName === "superadmin"
}

export function canModerateComments(roleName: string, postAuthorId: string, userId: string): boolean {
  if (roleName === "superadmin") return true
  if (roleName === "admin" && postAuthorId === userId) return true
  return false
}
