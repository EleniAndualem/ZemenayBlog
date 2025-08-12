"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Calendar, 
  User, 
  ArrowLeft,
  Send,
  ThumbsUp,
  Clock,
  Share2
} from "lucide-react"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import { formatRelativeDate, getReadingTime } from "@/lib/utils"

interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  readingTime?: number | null
  images?: string[]
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
  isLiked?: boolean
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    fullName: string
    profileImage?: Buffer
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liking, setLiking] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)

  useEffect(() => {
    if (params.slug) {
      fetchPost()
      fetchComments()
      trackView()
    }
  }, [params.slug])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      } else {
        router.push('/blog')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      // Track view when post is loaded
      await fetch(`/api/posts/${params.slug}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      // Silently fail - view tracking shouldn't break the page
      console.error('Failed to track view:', error)
    }
  }

  // Lightbox keyboard handlers
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight' && post?.images && lightboxIndex < post.images.length - 1) {
        setLightboxIndex((i) => i + 1)
      }
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) {
        setLightboxIndex((i) => i - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, lightboxIndex, post?.images])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLiking(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPost(prev => prev ? {
          ...prev,
          isLiked: data.isLiked,
          _count: {
            ...prev._count,
            likes: data.isLiked ? prev._count.likes + 1 : prev._count.likes - 1
          }
        } : null)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!commentContent.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentContent })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setCommentContent("")
        setPost(prev => prev ? {
          ...prev,
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1
          }
        } : null)
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">Back to blog</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to blog
        </Link>

        {/* Post header */}
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-4"
                style={{ 
                  backgroundColor: `${post.category.color}20`,
                  color: post.category.color
                }}
              >
                {post.category.name}
              </Link>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Removed excerpt under title as requested */}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{post.author.fullName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatRelativeDate(post.publishedAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {(post.readingTime ?? getReadingTime(post.content))} min read
                  </span>
                </div>
              </div>
              
              {/* Removed top actions (views/like/share) as requested */}
            </div>
          </header>

          {/* Post content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Images gallery before tags */}
          {post.images && post.images.length > 0 && (
            <section className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true) }}
                    className="relative aspect-video overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* Using next/image optional, fallback to img for data URI */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/jpeg;base64,${img}`} alt={`Post image ${idx + 1}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Lightbox Modal */}
          {lightboxOpen && post?.images && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
              >
                Close
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/jpeg;base64,${post.images[lightboxIndex]}`}
                alt={`Post image ${lightboxIndex + 1}`}
                className="max-h-[90vh] max-w-[95vw] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Tags and actions in a row */}
          {post.tags.length > 0 && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.tag.id}
                    href={`/blog?tag=${tag.tag.slug}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    #{tag.tag.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                  <Eye className="h-5 w-5" />
                  <span>{post.totalViews}</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                    post.isLiked ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post._count.likes}</span>
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link copied')
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* Removed separate actions bar; like is inline with views above */}

          {/* Comments section */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Comments ({post._count.comments})
            </h3>

            {/* Comment form */}
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <div className="flex space-x-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    required
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submittingComment ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Comments list */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.author.fullName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No comments yet — what do you think about this post? Share your thoughts below!
              </div>
            )}
          </section>
        </article>
      </main>

      <Footer />
    </div>
  )
}
