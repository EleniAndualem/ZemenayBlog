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
    const [currentStats, previousStats, recentPosts] = await Promise.all([
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
        // Views (from PostAnalytic)
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
        // Views (from PostAnalytic)
        prisma.postAnalytic.aggregate({
          where: {
            date: { gte: previousStartDate, lt: startDate }
          },
          _sum: {
            viewsCount: true
          }
        })
      ]),
      // Recent posts
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
          }
        },
        orderBy: {
          publishedAt: "desc"
        },
        take: 5
      })
    ])

    const [currentPosts, currentLikes, currentComments, currentUsers, currentViews] = currentStats
    const [previousPosts, previousLikes, previousComments, previousUsers, previousViews] = previousStats

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const postsChange = calculateChange(currentPosts, previousPosts)
    const likesChange = calculateChange(currentLikes, previousLikes)
    const commentsChange = calculateChange(currentComments, previousComments)
    const usersChange = calculateChange(currentUsers, previousUsers)
    const viewsChange = calculateChange(
      currentViews._sum.viewsCount || 0,
      previousViews._sum.viewsCount || 0
    )

    // Get daily stats for trends
    const dailyStats = await prisma.postAnalytic.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: {
        date: 'asc'
      }
    })

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
        views: 0, // Will be calculated from analytics
        likes: post._count.likes,
        comments: post._count.comments,
        createdAt: post.createdAt.toISOString()
      })),
      analytics: {
        viewsToday: dailyStats[dailyStats.length - 1]?.viewsCount || 0,
        likesToday: dailyStats[dailyStats.length - 1]?.likesCount || 0,
        commentsToday: dailyStats[dailyStats.length - 1]?.commentsCount || 0,
        trendsData: dailyStats.map(stat => ({
          date: stat.date.toISOString().split('T')[0],
          views: stat.viewsCount,
          likes: stat.likesCount,
          comments: stat.commentsCount
        }))
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
