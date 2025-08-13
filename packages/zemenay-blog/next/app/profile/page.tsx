"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "zemenay-blog/hooks/useAuth"
import { User, Mail, Lock, Camera, Save, Eye, EyeOff } from "lucide-react"
import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      if (user.profileImage) {
        try {
          const toImageUrl = (src: unknown): string | null => {
            try {
              if (!src) return null
              if (typeof src === 'string') {
                if (src.startsWith('data:') || src.startsWith('http')) return src
                return `data:image/jpeg;base64,${src}`
              }
              if (src instanceof File || src instanceof Blob) {
                return URL.createObjectURL(src)
              }
              if (src instanceof ArrayBuffer) {
                const blob = new Blob([src], { type: 'image/jpeg' })
                return URL.createObjectURL(blob)
              }
              if (src instanceof Uint8Array) {
                const blob = new Blob([src], { type: 'image/jpeg' })
                return URL.createObjectURL(blob)
              }
              if (Array.isArray(src)) {
                const arr = new Uint8Array(src as number[])
                const blob = new Blob([arr], { type: 'image/jpeg' })
                return URL.createObjectURL(blob)
              }
              if (typeof src === 'object' && src !== null) {
                const anySrc = src as any
                if (anySrc.type === 'Buffer' && Array.isArray(anySrc.data)) {
                  const arr = new Uint8Array(anySrc.data)
                  const blob = new Blob([arr], { type: 'image/jpeg' })
                  return URL.createObjectURL(blob)
                }
                if (Array.isArray(anySrc.data)) {
                  const arr = new Uint8Array(anySrc.data)
                  const blob = new Blob([arr], { type: 'image/jpeg' })
                  return URL.createObjectURL(blob)
                }
                if (anySrc.buffer instanceof ArrayBuffer) {
                  const blob = new Blob([anySrc.buffer], { type: 'image/jpeg' })
                  return URL.createObjectURL(blob)
                }
              }
            } catch (e) {
              console.warn('Failed to convert image source to URL', e)
            }
            return null
          }

          const imageUrl = toImageUrl(user.profileImage)
          setImagePreview(imageUrl)
        } catch (error) {
          console.error("Error processing profile image:", error)
          console.error("Profile image data:", user.profileImage)
          setImagePreview(null)
        }
      }
    }
  }, [user, loading, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setProfileImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError("Current password is required to set a new password")
        setSaving(false)
        return
      }
      if (!formData.newPassword) {
        setError("New password is required")
        setSaving(false)
        return
      }
      if (!formData.confirmPassword) {
        setError("Please confirm your new password")
        setSaving(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match")
        setSaving(false)
        return
      }
      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters")
        setSaving(false)
        return
      }
      if (formData.newPassword === formData.currentPassword) {
        setError("New password must be different from current password")
        setSaving(false)
        return
      }
    }

    try {
      const updateData = new FormData()

      if (formData.fullName !== user?.fullName) {
        updateData.append("fullName", formData.fullName)
      }
      if (formData.email !== user?.email) {
        updateData.append("email", formData.email)
      }
      if (formData.newPassword) {
        updateData.append("currentPassword", formData.currentPassword)
        updateData.append("newPassword", formData.newPassword)
      }
      if (profileImage) {
        updateData.append("profileImage", profileImage)
      }

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        body: updateData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
        setProfileImage(null)

        if (updateProfile) {
          await updateProfile({
            fullName: data.fullName,
            email: data.email,
            profileImage: data.profileImage ?? null,
            darkMode: data.darkMode,
          })
        }
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred while updating your profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Update your personal information and account settings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.fullName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role.name}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter current password to change"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}


