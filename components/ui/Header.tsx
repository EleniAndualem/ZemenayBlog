"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"
import { useAuth } from "@/hooks/useAuth"
import { Moon, Sun, Menu, X, User, LogOut, Settings } from "lucide-react"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch by rendering nothing until mounted
  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zememay logo.png" alt="Zemenay Blog" className="h-8 w-8 rounded" />
            <span className="font-bold text-xl gradient-text">Zemenay Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-foreground/80 hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/categories" className="text-foreground/80 hover:text-foreground transition-colors">
              Categories
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => toggleTheme()}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {typeof user.profileImage === 'string' && user.profileImage
                    ? (
                      <img
                        src={user.profileImage.startsWith('data:') ? (user.profileImage as string) : `data:image/jpeg;base64,${user.profileImage}`}
                        alt={user.fullName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  <span className="hidden sm:block text-sm font-medium">{user.fullName}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-popover p-1 shadow-lg">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    {["admin", "superadmin"].includes(user.role.name) && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-accent w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white btn-gradient rounded-lg transition-all hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/categories"
                className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>

              {!user && (
                <div className="mt-2 pt-2 border-t border-border/40 flex flex-col space-y-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="mx-4 px-4 py-2 text-sm font-medium text-white btn-gradient rounded-lg transition-all hover:shadow-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
