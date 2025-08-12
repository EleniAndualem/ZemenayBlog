"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import RichTextEditor from "@/components/RichTextEditor"
import { Save, Upload, X, ImageIcon, Folder, Calendar, AlertCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Category { id: number; name: string; slug: string }
interface PostTag { id: number; name: string; slug: string }

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const postId = params?.id as string

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const [confirm, setConfirm] = useState<{open:boolean; status?: "draft"|"published"}>({open:false})

  useEffect(() => {
    if (!postId) return
    ;(async () => {
      try {
        const [postRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`/api/admin/posts/${postId}`),
          fetch("/api/categories"),
          fetch("/api/tags"),
        ])
        if (postRes.ok) {
          const p = await postRes.json()
          setTitle(p.title)
          setContent(p.content)
          setExcerpt(p.excerpt || "")
          setCategoryId(p.categoryId || null)
          setSelectedTags(p.tagIds || [])
          setReadingTime(typeof p.readingTime === "number" ? p.readingTime : "")
          setThumbnail(p.thumbnailBase64 || null)
          setGalleryPreviews(p.images || [])
        }
        if (categoriesRes.ok) {
          const c = await categoriesRes.json()
          setCategories(c.categories || [])
        }
        if (tagsRes.ok) {
          const t = await tagsRes.json()
          setTags(t)
        }
      } catch (e) {
        setError("Failed to load post")
      }
    })()
  }, [postId])

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setThumbnailFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setThumbnail(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setGalleryFiles((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => setGalleryPreviews((prev) => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index))
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return
    try {
      setCreatingTag(true)
      const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
      const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, slug }) })
      if (res.ok) {
        const created = await res.json()
        setTags((prev) => [...prev, created])
        setSelectedTags((prev) => [...prev, created.id])
        setNewTagName("")
      }
    } finally {
      setCreatingTag(false)
    }
  }

  const handleSubmit = async (publishStatus: "draft" | "published") => {
    if (!title.trim() || !content.trim() || !categoryId) {
      setError("Title, content and category are required")
      return
    }
    setSaving(true)
    try {
      let thumbnailBase64: string | null | undefined = undefined
      if (thumbnailFile) thumbnailBase64 = await compressImageToJpegBase64(thumbnailFile, 0.8)
      const imagesBase64: string[] = []
      for (const f of galleryFiles) imagesBase64.push(await compressImageToJpegBase64(f, 0.8))
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          status: publishStatus,
          categoryId,
          readingTime: typeof readingTime === "number" ? readingTime : null,
          tags: selectedTags,
          thumbnail: typeof thumbnailBase64 === "string" ? thumbnailBase64 : (thumbnailBase64 === null ? null : undefined),
          images: imagesBase64.length > 0 ? imagesBase64 : undefined,
        }),
      })
      if (res.ok) {
        toast({ title: publishStatus === "published" ? "Post updated & published" : "Draft updated" })
        router.push("/admin/posts")
      } else {
        setError("Failed to update post")
        toast({ title: "Failed to update post" })
      }
    } catch (e) {
      setError("Failed to update post")
      toast({ title: "Failed to update post" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Edit your post..." />
            {!content.trim() && (
              <p className="mt-2 text-xs text-red-600">Content is required.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Images (Optional)</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload additional images</p>
              <input id="gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
              <label htmlFor="gallery-upload" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">Choose Files</label>
            </div>
            {galleryPreviews.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-40 h-28">
                      <img src={src} className="w-40 h-28 object-cover rounded-lg" />
                      <button onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><ImageIcon className="h-5 w-5 mr-2" />Featured Image</h3>
            {thumbnail ? (
              <div className="relative">
                <img src={thumbnail} className="w-full h-48 object-cover rounded-lg" />
                <button onClick={() => { setThumbnail(null); setThumbnailFile(null) }} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload a featured image</p>
                <input id="thumbnail-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <label htmlFor="thumbnail-upload" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">Choose File</label>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><Folder className="h-5 w-5 mr-2" />Category</h3>
            <select value={categoryId || ""} onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : null)} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Select a category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            {!categoryId && (
              <p className="mt-2 text-xs text-red-600">Category is required.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><Folder className="h-5 w-5 mr-2" />Tags</h3>
            <div className="flex items-center gap-2 mb-4">
              <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Create a new tag" className="min-w-0 flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <button onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()} className="shrink-0 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"><Plus className="h-4 w-4 mr-1" />{creatingTag ? "Adding..." : "Add"}</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map((t) => (
                <label key={t.id} className="flex items-center">
                  <input type="checkbox" checked={selectedTags.includes(t.id)} onChange={() => handleTagToggle(t.id)} className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Excerpt (Optional)</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reading Time (minutes)</label>
              <input type="number" min={1} value={readingTime} onChange={(e) => setReadingTime(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col gap-2">
              <button onClick={() => setConfirm({open:true, status:"draft"})} disabled={saving} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"><Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Draft"}</button>
              <button onClick={() => setConfirm({open:true, status:"published"})} disabled={saving} className="w-full inline-flex items-center justify-center px-4 py-2 btn-gradient text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"><Calendar className="h-4 w-4 mr-2" />{saving ? "Publishing..." : "Publish"}</button>
            </div>
          </div>
          {confirm.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-2">{confirm.status === "published" ? "Publish changes?" : "Save changes?"}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Confirm to continue.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConfirm({open: false})} className="px-4 py-2 rounded-lg border dark:border-gray-600">Cancel</button>
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


