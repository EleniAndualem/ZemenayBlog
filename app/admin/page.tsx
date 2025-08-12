"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { FileText, MessageSquare, Users, Eye, TrendingUp, BarChart3, Activity, Heart } from "lucide-react"

interface DashboardStats {
  totalPosts: number
  totalComments: number
  totalUsers: number
  totalViews: number
  totalLikes: number
  recentPosts: Array<{
    id: string
    title: string
    status: string
    views: number
    likes: number
    comments: number
    createdAt: string
  }>
  analytics: {
    viewsToday: number
    likesToday: number
    commentsToday: number
    trendsData: Array<{
      date: string
      views: number
      likes: number
      comments: number
    }>
  }
  changes: {
    posts: number
    views: number
    likes: number
    comments: number
  }
}

export default function AdminDashboard() {
  const { user, canManageAllPosts } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchDashboardStats()
  }, [timeRange])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/admin/dashboard?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    changeType,
  }: {
    title: string
    value: number | string
    icon: any
    color: string
    change?: string
    changeType?: "increase" | "decrease"
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <div
              className={`flex items-center mt-2 text-sm ${
                changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className={`h-4 w-4 mr-1 ${changeType === "decrease" ? "rotate-180" : ""}`} />
              {change}
            </div>
          )}
        </div>
        <div className={`h-12 w-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.fullName}! Here's what's happening with your blog.
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon={FileText}
          color="bg-blue-500"
          change={`${stats?.changes?.posts || 0}% from last period`}
          changeType={stats?.changes?.posts && stats.changes.posts > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Total Views"
          value={stats?.totalViews?.toLocaleString() || 0}
          icon={Eye}
          color="bg-green-500"
          change={`${stats?.changes?.views || 0}% from last period`}
          changeType={stats?.changes?.views && stats.changes.views > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Total Likes"
          value={stats?.totalLikes || 0}
          icon={Heart}
          color="bg-red-500"
          change={`${stats?.changes?.likes || 0}% from last period`}
          changeType={stats?.changes?.likes && stats.changes.likes > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Comments"
          value={stats?.totalComments || 0}
          icon={MessageSquare}
          color="bg-purple-500"
          change={`${stats?.changes?.comments || 0}% from last period`}
          changeType={stats?.changes?.comments && stats.changes.comments > 0 ? "increase" : "decrease"}
        />
      </div>

      {/* Today's Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Today's Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.analytics.viewsToday || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Views Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats?.analytics.likesToday || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Likes Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.analytics.commentsToday || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Comments Today</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Posts
            </h2>
          </div>
          <div className="p-6">
            {stats?.recentPosts && stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : post.status === "draft"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent posts</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <a
                href="/admin/posts/new"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-600"
              >
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Create New Post</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Write and publish a new article</p>
                </div>
              </a>

              <a
                href="/admin/posts"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-600"
              >
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Posts</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Edit, publish, or archive posts</p>
                </div>
              </a>

              <a
                href="/admin/comments"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-600"
              >
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Moderate Comments</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Review and manage comments</p>
                </div>
              </a>

              {canManageAllPosts() && (
                <a
                  href="/admin/users"
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group border border-gray-200 dark:border-gray-600"
                >
                  <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">View and manage all users</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      {stats?.analytics.trendsData && stats.analytics.trendsData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Trends
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Showing trends for the last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
          </div>
          {/* Simple trend indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {stats.analytics.trendsData.reduce((sum, day) => sum + day.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stats.analytics.trendsData.reduce((sum, day) => sum + day.likes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {stats.analytics.trendsData.reduce((sum, day) => sum + day.comments, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
