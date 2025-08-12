"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { BarChart3, TrendingUp, Eye, Heart, MessageSquare, Users, Calendar, Activity } from "lucide-react"

interface AnalyticsData {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalUsers: number
  viewsChange: number
  likesChange: number
  commentsChange: number
  usersChange: number
  dailyStats: Array<{
    date: string
    views: number
    likes: number
    comments: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [normalized, setNormalized] = useState<Array<{ date: string; views: number; likes: number; comments: number }>>([])
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: any } | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  useEffect(() => {
    setNormalized(analytics?.dailyStats ?? [])
  }, [analytics])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your content performance and user engagement
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
          title="Total Views"
          value={analytics?.totalViews?.toLocaleString() || 0}
          icon={Eye}
          color="bg-blue-500"
          change={`${analytics?.viewsChange || 0}% from last period`}
          changeType={analytics?.viewsChange && analytics.viewsChange > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Total Likes"
          value={analytics?.totalLikes || 0}
          icon={Heart}
          color="bg-red-500"
          change={`${analytics?.likesChange || 0}% from last period`}
          changeType={analytics?.likesChange && analytics.likesChange > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Total Comments"
          value={analytics?.totalComments || 0}
          icon={MessageSquare}
          color="bg-purple-500"
          change={`${analytics?.commentsChange || 0}% from last period`}
          changeType={analytics?.commentsChange && analytics.commentsChange > 0 ? "increase" : "decrease"}
        />

        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          color="bg-green-500"
          change={`${analytics?.usersChange || 0}% from last period`}
          changeType={analytics?.usersChange && analytics.usersChange > 0 ? "increase" : "decrease"}
        />
      </div>

      {/* Enhanced Engagement Chart */}
      {normalized.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Engagement Over Time
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Showing data for the last {timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Views</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Comments</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
                         <div className="min-w-[800px]">
               <EnhancedChart data={normalized} onHover={setHoveredPoint} hoveredPoint={hoveredPoint} />
             </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {normalized.reduce((sum, day) => sum + day.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {normalized.reduce((sum, day) => sum + day.likes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Likes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {normalized.reduce((sum, day) => sum + day.comments, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Comments</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Engagement Over Time
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No data available for the selected time range</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EnhancedChart({ 
  data, 
  onHover,
  hoveredPoint
}: { 
  data: Array<{ date: string; views: number; likes: number; comments: number }>
  onHover: (point: { x: number; y: number; data: any } | null) => void
  hoveredPoint: { x: number; y: number; data: any } | null
}) {
  const width = 800
  const height = 300
  const padding = { left: 60, right: 40, top: 40, bottom: 60 }

  const maxY = Math.max(1, ...data.map(d => Math.max(d.views, d.likes, d.comments)))
  const xStep = (width - padding.left - padding.right) / Math.max(1, data.length - 1)
  const yScale = (v: number) => padding.top + (height - padding.top - padding.bottom) * (1 - v / maxY)

  const pathFor = (key: 'views' | 'likes' | 'comments') => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + i * xStep} ${yScale(d[key])}`)
      .join(' ')
  }

  const yTicks = 5
  const grid = Array.from({ length: yTicks + 1 }, (_, i) => i)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Calculate which labels to show based on data length
  const getVisibleLabels = () => {
    if (data.length <= 7) {
      return data.map((d, i) => ({ data: d, index: i }))
    } else if (data.length <= 14) {
      // Show every other label
      return data.filter((_, i) => i % 2 === 0).map((d, i) => ({ data: d, index: data.indexOf(d) }))
    } else {
      // Show every 3rd label for longer ranges
      return data.filter((_, i) => i % 3 === 0).map((d, i) => ({ data: d, index: data.indexOf(d) }))
    }
  }

  const visibleLabels = getVisibleLabels()

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-80">
        {/* Grid */}
        {grid.map(i => {
          const y = padding.top + ((height - padding.top - padding.bottom) / yTicks) * i
          const value = Math.round((maxY / yTicks) * (yTicks - i))
          return (
            <g key={i}>
              <line 
                x1={padding.left} 
                x2={width - padding.right} 
                y1={y} 
                y2={y} 
                className="stroke-gray-200 dark:stroke-gray-700" 
              />
              <text 
                x={padding.left - 10} 
                y={y + 4} 
                className="fill-gray-500 dark:fill-gray-400 text-xs" 
                textAnchor="end"
              >
                {value.toLocaleString()}
              </text>
            </g>
          )
        })}

        {/* X-axis labels - only show visible ones */}
        {visibleLabels.map(({ data: d, index }) => (
          <text 
            key={index} 
            x={padding.left + index * xStep} 
            y={height - 20} 
            className="fill-gray-500 dark:fill-gray-400 text-xs" 
            textAnchor="middle"
          >
            {formatDate(d.date)}
          </text>
        ))}

        {/* Lines with hover effects */}
        <path d={pathFor('views')} className="stroke-blue-500" fill="none" strokeWidth={3} />
        <path d={pathFor('likes')} className="stroke-red-500" fill="none" strokeWidth={3} />
        <path d={pathFor('comments')} className="stroke-purple-500" fill="none" strokeWidth={3} />

        {/* Data points with hover */}
        {data.map((d, i) => {
          const x = padding.left + i * xStep
          return (
            <g key={i}>
              <circle 
                cx={x} 
                cy={yScale(d.views)} 
                r="4" 
                className="fill-blue-500 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => onHover({ x, y: yScale(d.views), data: { ...d, type: 'views' } })}
                onMouseLeave={() => onHover(null)}
              />
              <circle 
                cx={x} 
                cy={yScale(d.likes)} 
                r="4" 
                className="fill-red-500 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => onHover({ x, y: yScale(d.likes), data: { ...d, type: 'likes' } })}
                onMouseLeave={() => onHover(null)}
              />
              <circle 
                cx={x} 
                cy={yScale(d.comments)} 
                r="4" 
                className="fill-purple-500 cursor-pointer hover:r-6 transition-all"
                onMouseEnter={() => onHover({ x, y: yScale(d.comments), data: { ...d, type: 'comments' } })}
                onMouseLeave={() => onHover(null)}
              />
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div 
          className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm pointer-events-none z-10"
          style={{ 
            left: `${(hoveredPoint.x / width) * 100}%`, 
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-10px)'
          }}
        >
          <div className="font-medium text-gray-900 dark:text-white">
            {formatDate(hoveredPoint.data.date)}
          </div>
          <div className="text-blue-600 dark:text-blue-400">
            Views: {hoveredPoint.data.views.toLocaleString()}
          </div>
          <div className="text-red-600 dark:text-red-400">
            Likes: {hoveredPoint.data.likes}
          </div>
          <div className="text-purple-600 dark:text-purple-400">
            Comments: {hoveredPoint.data.comments}
          </div>
        </div>
      )}
    </div>
  )
}