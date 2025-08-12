"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  fullName: string
  role: {
    id: number
    name: string
  }
  // Can be serialized Buffer-like object, byte array, string data URL, blob, or null
  profileImage?: unknown | null
  darkMode: boolean
  createdAt: string
  updatedAt: string
}

  interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  updateTheme: (darkMode: boolean) => Promise<void>
    updateProfile: (data: { 
      fullName?: string; 
      email?: string;
      // Accept broad image representations to avoid Buffer usage client-side
      profileImage?: string | File | Blob | ArrayBuffer | Uint8Array | number[] | { type?: string; data?: number[]; buffer?: ArrayBuffer } | null;
      darkMode?: boolean;
    }) => Promise<boolean>
  isRole: (role: string) => boolean
  canManageAllPosts: () => boolean
  canManageOwnPosts: () => boolean
  canCreateAdmins: () => boolean
  canManageUsers: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: 'no-store' })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "An error occurred. Please try again." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const updateTheme = async (darkMode: boolean) => {
    try {
      const response = await fetch("/api/auth/update-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode }),
      })

      if (response.ok && user) {
        setUser({ ...user, darkMode })
      }
    } catch (error) {
      console.error("Theme update failed:", error)
    }
  }

  const updateProfile = async (data: { 
    fullName?: string; 
    email?: string;
    profileImage?: Buffer | File;
    darkMode?: boolean;
  }) => {
    try {
      // Update the user state directly with the provided data
      if (user) {
        const updatedUser = {
          ...user,
          ...data,
          // Handle profileImage properly
          profileImage: data.profileImage || user.profileImage
        }
        setUser(updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error("Profile update failed:", error)
      return false
    }
  }

  // Permission helpers
  const isRole = (role: string) => user?.role.name === role
  const canManageAllPosts = () => user?.role.name === "superadmin"
  const canManageOwnPosts = () => ["admin", "superadmin"].includes(user?.role.name || "")
  const canCreateAdmins = () => user?.role.name === "superadmin"
  const canManageUsers = () => user?.role.name === "superadmin"

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        updateTheme,
        updateProfile,
        isRole,
        canManageAllPosts,
        canManageOwnPosts,
        canCreateAdmins,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 