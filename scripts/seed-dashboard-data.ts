import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDashboardData() {
  try {
    console.log('🌱 Seeding dashboard data...')

    // Create sample posts with analytics
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'Getting Started with Next.js 14',
          slug: 'getting-started-nextjs-14',
          content: 'Next.js 14 introduces many new features...',
          excerpt: 'Learn about the latest features in Next.js 14',
          status: 'published',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          authorId: (await prisma.user.findFirst({ where: { role: { name: 'admin' } } }))?.id || '',
        }
      }),
      prisma.post.create({
        data: {
          title: 'Advanced TypeScript Patterns',
          slug: 'advanced-typescript-patterns',
          content: 'TypeScript offers powerful type system...',
          excerpt: 'Explore advanced TypeScript patterns for better code',
          status: 'published',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          authorId: (await prisma.user.findFirst({ where: { role: { name: 'admin' } } }))?.id || '',
        }
      }),
      prisma.post.create({
        data: {
          title: 'Building Scalable APIs',
          slug: 'building-scalable-apis',
          content: 'API design is crucial for scalability...',
          excerpt: 'Best practices for building scalable APIs',
          status: 'published',
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          authorId: (await prisma.user.findFirst({ where: { role: { name: 'admin' } } }))?.id || '',
        }
      })
    ])

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

    // Create sample likes
    await Promise.all([
      prisma.like.create({
        data: {
          postId: posts[0].id,
          userId: (await prisma.user.findFirst({ where: { role: { name: 'user' } } }))?.id || '',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.like.create({
        data: {
          postId: posts[1].id,
          userId: (await prisma.user.findFirst({ where: { role: { name: 'user' } } }))?.id || '',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      })
    ])

    // Create sample comments
    await Promise.all([
      prisma.comment.create({
        data: {
          content: 'Great article! Very helpful for beginners.',
          postId: posts[0].id,
          authorId: (await prisma.user.findFirst({ where: { role: { name: 'user' } } }))?.id || '',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.comment.create({
        data: {
          content: 'Thanks for sharing these insights!',
          postId: posts[1].id,
          authorId: (await prisma.user.findFirst({ where: { role: { name: 'user' } } }))?.id || '',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      })
    ])

    console.log('✅ Dashboard data seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDashboardData() 