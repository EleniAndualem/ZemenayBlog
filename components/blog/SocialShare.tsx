"use client"

import { useState } from "react"
import { Share2, Twitter, Facebook, Linkedin, LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SocialShareProps {
  url: string
  title: string
  description: string
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, "share", "width=600,height=400,scrollbars=yes,resizable=yes")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => openShareWindow(shareLinks.twitter)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Twitter className="w-4 h-4" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Facebook className="w-4 h-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Linkedin className="w-4 h-4" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2 cursor-pointer">
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
