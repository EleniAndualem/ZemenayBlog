"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Save, Upload, X, ImageIcon, Folder, Calendar, AlertCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RichTextEditor from "@/components/RichTextEditor"

interface Category {
  id: number
  name: string
  slug: string
}

interface PostTag {
  id: number
  name: string
  slug: string
}

export default function NewPostPage() {
  const { user, canManageOwnPosts } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [readingTime, setReadingTime] = useState<number | "">("")
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<PostTag[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [creatingTag, setCreatingTag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error" | null>(null)
  const { toast } = useToast()
  const [confirm, setConfirm] = useState<{open: boolean; status?: "draft" | "published"}>({open:false})

  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return

    const autoSaveTimer = setTimeout(() => {
      autoSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [title, content, excerpt])

  useEffect(() => {
    if (!canManageOwnPosts()) {
      router.push("/")
      return
    }

    fetchCategoriesAndTags()
  }, [])

  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([fetch("/api/categories"), fetch("/api/tags")])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData)
      }
    } catch (error) {
      console.error("Failed to fetch categories and tags:", error)
      // Set default empty arrays to prevent errors
      setCategories([])
      setTags([])
    }
  }

  const autoSave = async () => {
    if (!title.trim() || !content.trim()) return

    setAutoSaveStatus("saving")

    try {
      const response = await fetch("/api/admin/posts/auto-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim(),
          categoryId,
          tags: selectedTags,
        }),
      })

      if (response.ok) {
        setAutoSaveStatus("saved")
        setTimeout(() => setAutoSaveStatus(null), 2000)
      } else {
        setAutoSaveStatus("error")
      }
    } catch (error) {
      setAutoSaveStatus("error")
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setThumbnailFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnail(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailFile(null)
  }

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const valid: File[] = []
    const previews: string[] = []
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return
      if (file.size > 5 * 1024 * 1024) return
      valid.push(file)
    })
    setGalleryFiles((prev) => [...prev, ...valid])
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => setGalleryPreviews((prev) => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const compressImageToJpegBase64 = useCallback(async (file: File, quality = 0.8): Promise<string> => {
    const imgBitmap = await createImageBitmap(file)
    const canvas = document.createElement("canvas")
    canvas.width = imgBitmap.width
    canvas.height = imgBitmap.height
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(imgBitmap, 0, 0)
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", quality))
    const base64: string = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(",")[1])
      reader.readAsDataURL(blob)
    })
    return base64
  }, [])

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    try {
      setCreatingTag(true)
      // generate slug simple
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      })
      if (res.ok) {
        const created = await res.json()
        setTags((prev) => [...prev, created])
        setSelectedTags((prev) => [...prev, created.id])
        setNewTagName("")
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to create tag")
      }
    } catch (e) {
      setError("Failed to create tag")
    } finally {
      setCreatingTag(false)
    }
  }

  const handleSubmit = async (publishStatus: "draft" | "published" | "archived") => {
    if (!title.trim() || !content.trim() || !categoryId || !thumbnailFile) {
      setError("Title, content, category, and featured image are required")
      return
    }

    if (!categoryId) {
      setError("Category is required")
      return
    }

    setSaving(true)
    setError("")

    try {
      let thumbnailBase64: string | null = null
      if (thumbnailFile) {
        // compress thumbnail
        thumbnailBase64 = await compressImageToJpegBase64(thumbnailFile, 0.8)
      }

      // compress gallery images
      const galleryBase64: string[] = []
      for (const file of galleryFiles) {
        const b64 = await compressImageToJpegBase64(file, 0.8)
        galleryBase64.push(b64)
      }

          const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          thumbnail: thumbnailBase64,
          status: publishStatus,
          categoryId,
          tags: selectedTags,
              readingTime: typeof readingTime === "number" ? readingTime : null,
          images: galleryBase64,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({ title: publishStatus === "published" ? "Post published" : "Draft saved" })
        router.push("/admin/posts")
      } else {
        setError(data.error || "Failed to create post")
        toast({ title: data.error || "Failed to create post" })
      }
    } catch (error) {
      setError("An error occurred while creating the post")
      toast({ title: "An error occurred while creating the post" })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Open preview in new tab
    const previewData = {
      title,
      content,
      excerpt,
      thumbnail,
      category: categories.find((c) => c.id === categoryId),
      tags: tags.filter((t) => selectedTags.includes(t.id)),
    }

    localStorage.setItem("post-preview", JSON.stringify(previewData))
    window.open("/admin/posts/preview", "_blank")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Write and publish your article</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {autoSaveStatus && (
            <div
              className={`flex items-center text-sm ${
                autoSaveStatus === "saved"
                  ? "text-green-600"
                  : autoSaveStatus === "saving"
                    ? "text-blue-600"
                    : "text-red-600"
              }`}
            >
              {autoSaveStatus === "saved" && "✓ Auto-saved"}
              {autoSaveStatus === "saving" && "Saving..."}
              {autoSaveStatus === "error" && "⚠ Save failed"}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your post..." />
            {!content.trim() && (
              <p className="mt-2 text-xs text-red-600">Content is required.</p>
            )}
          </div>

          {/* Additional Images (Optional) - below excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Images (Optional)</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload additional images</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Choose Files
              </label>
            </div>

            {galleryPreviews.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-40 h-28">
                      <img src={src} alt={`Preview ${idx + 1}`} className="w-40 h-28 object-cover rounded-lg" />
                      <button
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Removed: Publish buttons here; will appear under Excerpt in sidebar */}

          {/* Removed: Additional Images section under excerpt as requested */}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Featured Image
            </h3>

            {thumbnail ? (
              <div className="relative">
                <img
                  src={thumbnail || "/placeholder.svg"}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload a featured image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>

          {/* Removed: Publish block from sidebar */}

          {/* Removed: Additional Images box under thumbnail as requested */}

          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Category
            </h3>

            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {!categoryId && (
              <p className="mt-2 text-xs text-red-600">Category is required.</p>
            )}
          </div>

          {/* Removed: Reading Time - not present in DB */}

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Folder className="h-5 w-5 mr-2" />
              Tags
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Create a new tag"
                className="min-w-0 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                disabled={creatingTag || !newTagName.trim()}
                className="shrink-0 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                {creatingTag ? "Adding..." : "Add"}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <label key={tag.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                </label>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No tags found. Create tags in the Tags section.</p>)
              }
            </div>
          </div>

          {/* Excerpt (Optional) under Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt (Optional)
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of your post (will be auto-generated if left empty)..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
            />

            {/* Reading Time */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reading Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g., 5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Publish buttons under Excerpt (stacked, responsive) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-col gap-2">
              <button
                onClick={() => setConfirm({open:true, status:"draft"})}
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => setConfirm({open:true, status:"published"})}
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-2 btn-gradient text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {saving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
          {confirm.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-2">{confirm.status === "published" ? "Publish post?" : "Save draft?"}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Confirm to continue.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>setConfirm({open:false})} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancel</button>
                  <button onClick={() => {
                    if (confirm.status) {
                      setConfirm({open: false})
                      handleSubmit(confirm.status)
                    }
                  }} className="px-4 py-2 rounded-lg btn-gradient text-white">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
