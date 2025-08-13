const { PrismaClient } = require('zemenay-blog/prisma/generated/client')

const prisma = new PrismaClient()

async function checkPosts() {
  try {
    console.log('🔍 [zemenay-blog] Checking posts...')
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📝 [zemenay-blog] Found ${posts.length} posts:`)
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Author: ${post.author.fullName}`)
      console.log(`   Published: ${post.publishedAt}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ [zemenay-blog] Error checking posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPosts()


