"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp, Users, BookOpen, Star, Eye, Heart, MessageSquare, Clock } from "lucide-react"
import Header from "../components/ui/Header"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail?: Buffer
  publishedAt: string
  author: {
    id: string
    fullName: string
    profileImage?: Buffer
  }
  category?: {
    id: number
    name: string
    slug: string
    color: string
  }
  tags: Array<{
    tag: {
      id: number
      name: string
      slug: string
    }
  }>
  _count: {
    likes: number
    comments: number
  }
  totalViews: number
}

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedPosts()
  }, [])

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/posts?limit=3&sortBy=newest')
      if (response.ok) {
        const data = await response.json()
        setFeaturedPosts(data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch recent posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to the Future of <span className="gradient-text">CREATIVITY</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover amazing stories, insights, and ideas from our community of writers. Join thousands of readers
              exploring content that matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white btn-gradient rounded-lg transition-all hover:shadow-lg group"
              >
                Explore Blog
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-3 text-lg font-medium border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full gradient-bg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">10K+</h3>
              <p className="text-muted-foreground">Active Readers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full gradient-bg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Articles Published</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full gradient-bg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">95%</h3>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full gradient-bg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">4.9/5</h3>
              <p className="text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Articles</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Check out our latest articles and stories from the community
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-gradient rounded-xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="card-gradient rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={
                          post.thumbnail
                            ? `data:image/jpeg;base64,${post.thumbnail}`
                            : `/placeholder.svg?height=250&width=400&query=${encodeURIComponent(post.title)}`
                        }
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.category.color || "#3B82F6" }}
                          >
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>{getReadingTime(post.content)} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {post.author.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{post.author.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.totalViews}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post._count.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post._count.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 font-medium text-blue-600 hover:text-blue-700 transition-colors group"
            >
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="relative overflow-hidden py-16 bg-background dark:newsletter-gradient">
        {/* Light mode subtle hero-like overlay */}
        <div className="absolute inset-0 gradient-bg opacity-10 dark:hidden" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-muted-foreground dark:text-white/90 mb-8">
              Get the latest articles and insights delivered to your inbox
            </p>
            <div className="max-w-md mx-auto">
              <div className="bg-white/60 dark:bg-white/10 backdrop-blur rounded-xl p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors dark:bg-white dark:text-blue-600 dark:hover:bg-gray-100">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
