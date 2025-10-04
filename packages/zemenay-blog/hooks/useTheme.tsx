"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./useAuth"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const { user, updateTheme } = useAuth()

  // Ensure hydration consistency
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (user) {
        // Use user's preference if logged in
        setTheme(user.darkMode ? "dark" : "light")
      } else {
        // Use localStorage for guests
        const savedTheme = localStorage.getItem("theme") as Theme
        if (savedTheme) {
          setTheme(savedTheme)
        }
      }
    }
  }, [user, mounted])

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark")

      // Save to localStorage for guests
      if (!user) {
        localStorage.setItem("theme", theme)
      }
    }
  }, [theme, user, mounted])

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    if (user) {
      // Update user preference in database
      await updateTheme(newTheme === "dark")
    }
  }

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return <ThemeContext.Provider value={{ theme: "dark", toggleTheme }}>{children}</ThemeContext.Provider>
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 