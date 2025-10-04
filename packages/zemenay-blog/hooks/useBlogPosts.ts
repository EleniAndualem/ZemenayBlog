"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { debounce } from "@/lib/utils"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  status: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    fullName: string
    profileImage?: Uint8Array
  }
  category: {
    id: string
    name: string
    slug: string
  }
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  _count: {
    likes: number
    comments: number
  }
  analytics: Array<{
    viewsCount: number
    likesCount: number
    commentsCount: number
  }>
}

interface SearchFilters {
  search: string
  category: string
  tags: string[]
  sortBy: string
}

interface UseBlogPostsReturn {
  posts: Post[]
  loading: boolean
  error: string | null
  filters: SearchFilters
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  setFilters: (filters: SearchFilters) => void
  setPage: (page: number) => void
  loadMore: () => void
  retry: () => void
}

export function useBlogPosts(initialItemsPerPage = 9): UseBlogPostsReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage,
  })

  // Initialize filters from URL params
  const [filters, setFiltersState] = useState<SearchFilters>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    sortBy: searchParams.get("sortBy") || "newest",
  })

  // Debounced function to update URL
  const updateURL = useCallback(
    debounce((newFilters: SearchFilters, page: number) => {
      const params = new URLSearchParams()

      if (newFilters.search) params.set("search", newFilters.search)
      if (newFilters.category) params.set("category", newFilters.category)
      if (newFilters.tags.length > 0) params.set("tags", newFilters.tags.join(","))
      if (newFilters.sortBy !== "newest") params.set("sortBy", newFilters.sortBy)
      if (page > 1) params.set("page", page.toString())

      const newURL = `${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`
      router.push(newURL, { scroll: false })
    }, 300),
    [router],
  )

  const fetchPosts = useCallback(
    async (currentFilters: SearchFilters, page: number, append = false) => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.itemsPerPage.toString(),
          sortBy: currentFilters.sortBy,
        })

        if (currentFilters.search) params.set("search", currentFilters.search)
        if (currentFilters.category) params.set("category", currentFilters.category)
        if (currentFilters.tags.length > 0) params.set("tags", currentFilters.tags.join(","))

        const response = await fetch(`/api/posts?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch posts")
        }

        const data = await response.json()

        if (append) {
          setPosts((prev) => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }

        setPagination({
          currentPage: data.pagination.page,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.total,
          itemsPerPage: data.pagination.limit,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching posts:", err)
      } finally {
        setLoading(false)
      }
    },
    [pagination.itemsPerPage],
  )

  // Set filters and update URL
  const setFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFiltersState(newFilters)
      const newPage = 1 // Reset to first page when filters change
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
      updateURL(newFilters, newPage)
      fetchPosts(newFilters, newPage)
    },
    [updateURL, fetchPosts],
  )

  // Set page
  const setPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, currentPage: page }))
      updateURL(filters, page)
      fetchPosts(filters, page)
    },
    [filters, updateURL, fetchPosts],
  )

  // Load more posts (for infinite scroll/load more)
  const loadMore = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      const nextPage = pagination.currentPage + 1
      setPagination((prev) => ({ ...prev, currentPage: nextPage }))
      fetchPosts(filters, nextPage, true)
    }
  }, [pagination.currentPage, pagination.totalPages, loading, filters, fetchPosts])

  // Retry function
  const retry = useCallback(() => {
    fetchPosts(filters, pagination.currentPage)
  }, [filters, pagination.currentPage, fetchPosts])

  // Initial load and URL param changes
  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    setPagination((prev) => ({ ...prev, currentPage: page }))
    fetchPosts(filters, page)
  }, []) // Only run on mount

  return {
    posts,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPage,
    loadMore,
    retry,
  }
}
