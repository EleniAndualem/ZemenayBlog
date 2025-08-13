"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import { BookOpen, Code, Palette, TrendingUp, Users, Lightbulb, Database, Globe, Shield, Zap } from "lucide-react"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  color: string
  _count: {
    posts: number
  }
}

const categoryIcons: { [key: string]: any } = {
  'Technology': Code,
  'Programming': Code,
  'Design': Palette,
  'Business': TrendingUp,
  'Community': Users,
  'Innovation': Lightbulb,
  'Data Science': Database,
  'Web Development': Globe,
  'Security': Shield,
  'Performance': Zap,
  'default': BookOpen
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const Icon = categoryIcons[categoryName] || categoryIcons.default
    return Icon
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Explore Categories
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover content organized by topics that interest you most
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name)
            return (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="group block"
              >
                <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color || "#3B82F6" }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {category._count.posts} posts
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
      <Footer />
    </div>
  )
}


