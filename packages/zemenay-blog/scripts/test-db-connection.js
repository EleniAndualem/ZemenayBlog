const { PrismaClient } = require('zemenay-blog/prisma/generated/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 [zemenay-blog] Testing database connection...')
    await prisma.$connect()
    console.log('✅ [zemenay-blog] Database connection successful!')

    const userCount = await prisma.user.count()
    console.log(`📊 Users: ${userCount}`)
    const postCount = await prisma.post.count()
    console.log(`📝 Posts: ${postCount}`)
    const categoryCount = await prisma.category.count()
    console.log(`📂 Categories: ${categoryCount}`)
  } catch (error) {
    console.error('❌ [zemenay-blog] Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()


