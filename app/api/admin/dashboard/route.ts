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
    const range = searchParams.get("range") || "7d"

    // Calculate date range
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    let startDate: Date
    let previousStartDate: Date

    switch (range) {
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get current period stats
    const [currentStats, previousStats, recentPosts, todayStats] = await Promise.all([
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
      ]),
      // Recent posts with real view data
      prisma.post.findMany({
        where: {
          status: "published"
        },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          analytics: {
            select: {
              viewsCount: true
            }
          }
        },
        orderBy: {
          publishedAt: "desc"
        },
        take: 5
      }),
      // Today's specific stats
      Promise.all([
        prisma.like.count({
          where: {
            createdAt: { gte: today }
          }
        }),
        prisma.comment.count({
          where: {
            createdAt: { gte: today }
          }
        }),
        prisma.post.count({
          where: {
            publishedAt: { gte: today },
            status: "published"
          }
        }),
        // Get real views for today
        prisma.postAnalytic.aggregate({
          where: {
            date: { gte: today }
          },
          _sum: {
            viewsCount: true
          }
        })
      ])
    ])

    const [currentPosts, currentLikes, currentComments, currentUsers, currentViews] = currentStats
    const [previousPosts, previousLikes, previousComments, previousUsers, previousViews] = previousStats
    const [likesToday, commentsToday, postsToday, viewsToday] = todayStats

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const postsChange = calculateChange(currentPosts, previousPosts)
    const likesChange = calculateChange(currentLikes, previousLikes)
    const commentsChange = calculateChange(currentComments, previousComments)
    const usersChange = calculateChange(currentUsers, previousUsers)
    const viewsChange = calculateChange(currentViews._sum.viewsCount || 0, previousViews._sum.viewsCount || 0)

    // Generate daily trends data for the last 7 days using real data
    const trendsData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
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
      
      trendsData.push({
        date: date.toISOString().split('T')[0],
        views: dayViews._sum.viewsCount || 0,
        likes: dayLikes,
        comments: dayComments
      })
    }

    return NextResponse.json({
      totalPosts: currentPosts,
      totalComments: currentComments,
      totalUsers: currentUsers,
      totalViews: currentViews._sum.viewsCount || 0,
      totalLikes: currentLikes,
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        views: post.analytics.reduce((sum, analytic) => sum + analytic.viewsCount, 0),
        likes: post._count.likes,
        comments: post._count.comments,
        createdAt: post.createdAt.toISOString()
      })),
      analytics: {
        viewsToday: viewsToday._sum.viewsCount || 0,
        likesToday: likesToday,
        commentsToday: commentsToday,
        trendsData: trendsData
      },
      changes: {
        posts: postsChange,
        likes: likesChange,
        comments: commentsChange,
        users: usersChange,
        views: viewsChange
      }
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
