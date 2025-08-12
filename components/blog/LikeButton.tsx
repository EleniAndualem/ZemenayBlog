"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

interface LikeButtonProps {
  postSlug: string
  initialLikes: number
}

export default function LikeButton({ postSlug, initialLikes }: LikeButtonProps) {
  const { user } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkLikeStatus()
    }
  }, [user, postSlug])

  const checkLikeStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${postSlug}/like-status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = "/auth/login"
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikes(data.totalLikes)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </Button>
  )
}
