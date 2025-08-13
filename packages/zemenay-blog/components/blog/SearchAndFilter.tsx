"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, ChevronDown, SortAsc } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

interface SearchFilters {
  search: string
  category: string
  tags: string[]
  sortBy: string
}

interface SearchAndFilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  totalResults: number
}

export default function SearchAndFilter({ filters, onFiltersChange, totalResults }: SearchAndFilterProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiltersData()
  }, [])

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([fetch("/api/categories"), fetch("/api/tags")])

      if (categoriesRes.ok && tagsRes.ok) {
        const [categoriesData, tagsData] = await Promise.all([categoriesRes.json(), tagsRes.json()])
        setCategories(categoriesData)
        setTags(tagsData)
      }
    } catch (error) {
      console.error("Failed to fetch filter data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCategoryChange = (categorySlug: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === categorySlug ? "" : categorySlug,
    })
  }

  const handleTagToggle = (tagSlug: string) => {
    const newTags = filters.tags.includes(tagSlug)
      ? filters.tags.filter((t) => t !== tagSlug)
      : [...filters.tags, tagSlug]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      category: "",
      tags: [],
      sortBy: "newest",
    })
  }

  const hasActiveFilters = filters.search || filters.category || filters.tags.length > 0

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
    { value: "liked", label: "Most Liked" },
    { value: "commented", label: "Most Commented" },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts by title or content..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Filter Toggle and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {totalResults} {totalResults === 1 ? "post" : "posts"} found
        {hasActiveFilters && " with current filters"}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.category === category.slug
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category.name} ({category._count.posts})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Tags</h3>
              {tags.length > 10 && (
                <button onClick={() => setShowTags(!showTags)} className="text-sm text-blue-600 hover:text-blue-700">
                  {showTags ? "Show Less" : `Show All (${tags.length})`}
                </button>
              )}
            </div>
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(showTags ? tags : tags.slice(0, 10)).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.slug)}
                    className={`px-2 py-1 rounded text-xs border transition-colors ${
                      filters.tags.includes(tag.slug)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tag.name} ({tag._count.posts})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                <span>Search: "{filters.search}"</span>
                <button onClick={() => handleSearchChange("")} className="ml-1 hover:text-blue-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {filters.category && (
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                <span>Category: {categories.find((c) => c.slug === filters.category)?.name}</span>
                <button onClick={() => handleCategoryChange(filters.category)} className="ml-1 hover:text-purple-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {filters.tags.map((tagSlug) => {
              const tag = tags.find((t) => t.slug === tagSlug)
              return tag ? (
                <div
                  key={tagSlug}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  <span>Tag: {tag.name}</span>
                  <button onClick={() => handleTagToggle(tagSlug)} className="ml-1 hover:text-green-600">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
