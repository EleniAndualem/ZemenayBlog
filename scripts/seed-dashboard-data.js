const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDashboardData() {
  try {
    console.log('🌱 Seeding dashboard data...')

    // Get existing users
    const adminUser = await prisma.user.findFirst({ 
      where: { role: { name: 'admin' } },
      select: { id: true }
    })
    
    const regularUser = await prisma.user.findFirst({ 
      where: { role: { name: 'user' } },
      select: { id: true }
    })

    if (!adminUser) {
      console.log('❌ No admin user found. Please run the main seed script first.')
      return
    }

    // Create sample posts with analytics
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'Getting Started with Next.js 14',
          slug: 'getting-started-nextjs-14',
          content: 'Next.js 14 introduces many new features including the App Router, Server Components, and improved performance. This guide will walk you through the key improvements and how to leverage them in your projects.',
          excerpt: 'Learn about the latest features in Next.js 14 and how to use them effectively.',
          status: 'published',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          authorId: adminUser.id,
        }
      }),
      prisma.post.create({
        data: {
          title: 'Advanced TypeScript Patterns',
          slug: 'advanced-typescript-patterns',
          content: 'TypeScript offers powerful type system features that can help you write more maintainable and robust code. In this article, we explore advanced patterns like conditional types, mapped types, and utility types.',
          excerpt: 'Explore advanced TypeScript patterns for better code organization and type safety.',
          status: 'published',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          authorId: adminUser.id,
        }
      }),
      prisma.post.create({
        data: {
          title: 'Building Scalable APIs',
          slug: 'building-scalable-apis',
          content: 'API design is crucial for scalability and maintainability. Learn about RESTful principles, authentication, rate limiting, and best practices for building APIs that can handle high traffic.',
          excerpt: 'Best practices for building scalable and maintainable APIs.',
          status: 'published',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          authorId: adminUser.id,
        }
      })
    ])

    console.log('✅ Created', posts.length, 'posts')

    // Create sample analytics data
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)

    await Promise.all([
      // Today's analytics
      prisma.postAnalytic.create({
        data: {
          postId: posts[0].id,
          date: today,
          viewsCount: 150,
          likesCount: 25,
          commentsCount: 8
        }
      }),
      // Yesterday's analytics
      prisma.postAnalytic.create({
        data: {
          postId: posts[0].id,
          date: yesterday,
          viewsCount: 120,
          likesCount: 20,
          commentsCount: 6
        }
      }),
      // Two days ago analytics
      prisma.postAnalytic.create({
        data: {
          postId: posts[0].id,
          date: twoDaysAgo,
          viewsCount: 100,
          likesCount: 15,
          commentsCount: 4
        }
      })
    ])

    console.log('✅ Created analytics data')

    // Create sample likes
    if (regularUser) {
      await Promise.all([
        prisma.like.create({
          data: {
            postId: posts[0].id,
            userId: regularUser.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        }),
        prisma.like.create({
          data: {
            postId: posts[1].id,
            userId: regularUser.id,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        })
      ])

      console.log('✅ Created likes')

      // Create sample comments
      await Promise.all([
        prisma.comment.create({
          data: {
            content: 'Great article! Very helpful for beginners.',
            postId: posts[0].id,
            authorId: regularUser.id,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        }),
        prisma.comment.create({
          data: {
            content: 'Thanks for sharing these insights!',
            postId: posts[1].id,
            authorId: regularUser.id,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        })
      ])

      console.log('✅ Created comments')
    }

    console.log('✅ Dashboard data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDashboardData() 