"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Filter,
  Grid,
  List,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { BlogListSkeleton } from "@/components/ui/LoadingSkeleton"
import { formatRelativeDate, getReadingTime, debounce } from "@/lib/utils"

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

interface Category {
  id: number
  name: string
  slug: string
  color: string
  _count: {
    posts: number
  }
}

interface Tag {
  id: number
  name: string
  slug: string
  _count: {
    posts: number
  }
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

function BlogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State management
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get("tags")?.split(",").filter(Boolean) || [])
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    updateURL({ search: query, page: "1" })
  }, 500)

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "") {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })

    const newURL = `/blog${newParams.toString() ? `?${newParams.toString()}` : ""}`
    router.push(newURL, { scroll: false })
  }

  const fetchPosts = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
      })

      if (searchQuery) params.set("search", searchQuery)
      if (selectedCategory) params.set("category", selectedCategory)
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
      if (sortBy) params.set("sortBy", sortBy)

      const response = await fetch(`/api/posts?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      if (append) {
        setPosts((prev) => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }

      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err)
    }
  }

  // Effects
  useEffect(() => {
    fetchPosts()
    fetchCategories()
    fetchTags()
  }, [selectedCategory, selectedTags, sortBy])

  useEffect(() => {
    if (searchQuery !== (searchParams.get("search") || "")) {
      debouncedSearch(searchQuery)
    }
  }, [searchQuery])

  // Event handlers
  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = categorySlug === selectedCategory ? "" : categorySlug
    setSelectedCategory(newCategory)
    updateURL({ category: newCategory, page: "1" })
  }

  const handleTagToggle = (tagSlug: string) => {
    const newTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter((t) => t !== tagSlug)
      : [...selectedTags, tagSlug]

    setSelectedTags(newTags)
    updateURL({ tags: newTags.join(","), page: "1" })
  }

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    updateURL({ sortBy: newSortBy, page: "1" })
  }

  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() })
    fetchPosts(page)
  }

  const handleLoadMore = () => {
    if (pagination?.hasNextPage) {
      fetchPosts(pagination.currentPage + 1, true)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedTags([])
    setSortBy("newest")
    router.push("/blog")
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0 || sortBy !== "newest"

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">Oops! Something went wrong</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => fetchPosts()} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Discover Amazing Content</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of insightful articles, tutorials, and stories from industry experts.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Active</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="liked">Most Liked</option>
                <option value="commented">Most Commented</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Categories</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={`flex items-center justify-between w-full p-2 rounded-lg text-left transition-colors ${
                            selectedCategory === category.slug
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || "#3B82F6" }}
                            />
                            <span>{category.name}</span>
                          </div>
                          <span className="text-sm opacity-70">{category._count.posts}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.slug)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedTags.includes(tag.slug)
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent hover:bg-accent/80"
                          }`}
                        >
                          #{tag.name} ({tag._count.posts})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-primary/80">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Category: {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => handleCategoryChange(selectedCategory)} className="hover:text-primary/80">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedTags.map((tagSlug) => (
                <span
                  key={tagSlug}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  Tag: {tags.find((t) => t.slug === tagSlug)?.name}
                  <button onClick={() => handleTagToggle(tagSlug)} className="hover:text-primary/80">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Results Info */}
          {pagination && (
            <div className="text-sm text-muted-foreground mb-6">
              {pagination.totalCount > 0 ? (
                <>
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}-
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{" "}
                  {pagination.totalCount} results
                </>
              ) : (
                "No results found"
              )}
            </div>
          )}
        </div>

        {/* Posts Grid/List */}
        {loading && posts.length === 0 ? (
          <BlogListSkeleton />
        ) : posts.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">No posts found</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters ? "Try adjusting your filters or search terms." : "There are no published posts yet."}
              </p>
              {hasActiveFilters && <Button onClick={clearFilters}>Clear Filters</Button>}
            </CardContent>
          </Card>
        ) : (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {posts.map((post, index) => (
                <ErrorBoundary key={post.id}>
                  <Card
                    className={`group hover:shadow-lg transition-all duration-300 ${viewMode === "list" ? "flex" : ""}`}
                  >
                    <div className={`relative overflow-hidden ${viewMode === "list" ? "w-1/3" : "aspect-video"}`}>
                      <Image
                        src={
                          post.thumbnail
                            ? `data:image/jpeg;base64,${Buffer.from(post.thumbnail).toString("base64")}`
                            : `/placeholder.svg?height=250&width=400&query=${encodeURIComponent(post.title)}`
                        }
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index < 3}
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

                    <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((postTag) => (
                            <span
                              key={postTag.tag.id}
                              className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full"
                            >
                              #{postTag.tag.name}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">{post.author.fullName.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{post.author.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeDate(new Date(post.publishedAt))}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.totalViews}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post._count.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post._count.comments}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ErrorBoundary>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 7) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 4) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 3) {
                        pageNum = pagination.totalPages - 6 + i
                      } else {
                        pageNum = pagination.currentPage - 3 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>

                {/* Load More Option */}
                {pagination.hasNextPage && (
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Posts"
                      )}
                    </Button>
                  </div>
                )}

                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function BlogPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-12">
              <div className="text-center mb-12">
                <div className="h-12 bg-muted rounded w-96 mx-auto mb-6 animate-pulse" />
                <div className="h-6 bg-muted rounded w-128 mx-auto animate-pulse" />
              </div>
              <BlogListSkeleton />
            </div>
            <Footer />
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </ErrorBoundary>
  )
}
