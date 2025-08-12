import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user || !["admin", "superadmin"].includes(user.role.name)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // Calculate date range
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let startDate: Date
    let previousStartDate: Date
    let daysToShow: number

    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        daysToShow = 7
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        daysToShow = 30 // Show last 30 days for 90d range
        break
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        daysToShow = 30
    }

    // Get current period stats
    const [currentStats, previousStats] = await Promise.all([
      // Current period
      Promise.all([
        prisma.post.count({
          where: {
            publishedAt: { gte: startDate },
            status: "published"
          }
        }),
        prisma.like.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        // Get real views from PostAnalytic
        prisma.postAnalytic.aggregate({
          where: {
            date: { gte: startDate }
          },
          _sum: {
            viewsCount: true
          }
        })
      ]),
      // Previous period
      Promise.all([
        prisma.post.count({
          where: {
            publishedAt: { gte: previousStartDate, lt: startDate },
            status: "published"
          }
        }),
        prisma.like.count({
          where: {
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        }),
        // Get real views from PostAnalytic for previous period
        prisma.postAnalytic.aggregate({
          where: {
            date: { gte: previousStartDate, lt: startDate }
          },
          _sum: {
            viewsCount: true
          }
        })
      ])
    ])

    const [currentPosts, currentLikes, currentComments, currentUsers, currentViews] = currentStats
    const [previousPosts, previousLikes, previousComments, previousUsers, previousViews] = previousStats

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const viewsChange = calculateChange(currentViews._sum.viewsCount || 0, previousViews._sum.viewsCount || 0)
    const likesChange = calculateChange(currentLikes, previousLikes)
    const commentsChange = calculateChange(currentComments, previousComments)
    const usersChange = calculateChange(currentUsers, previousUsers)

    // Generate daily stats for the chart using real data
    const dailyStats = []
    const chartStartDate = new Date(today.getTime() - (daysToShow - 1) * 24 * 60 * 60 * 1000)
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(chartStartDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const [dayLikes, dayComments, dayViews] = await Promise.all([
        prisma.like.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd }
          }
        }),
        // Get real views for this day
        prisma.postAnalytic.aggregate({
          where: {
            date: { gte: dayStart, lt: dayEnd }
          },
          _sum: {
            viewsCount: true
          }
        })
      ])
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        views: dayViews._sum.viewsCount || 0,
        likes: dayLikes,
        comments: dayComments
      })
    }

    return NextResponse.json({
      totalViews: currentViews._sum.viewsCount || 0,
      totalLikes: currentLikes,
      totalComments: currentComments,
      totalUsers: currentUsers,
      viewsChange,
      likesChange,
      commentsChange,
      usersChange,
      dailyStats: dailyStats
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 