const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkPosts() {
  try {
    console.log('🔍 Checking posts...')
    
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        author: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📝 Found ${posts.length} posts:`)
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Author: ${post.author.fullName}`)
      console.log(`   Published: ${post.publishedAt}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPosts() 