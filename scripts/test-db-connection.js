const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`📊 Found ${userCount} users in database`)
    
    const postCount = await prisma.post.count()
    console.log(`📝 Found ${postCount} posts in database`)
    
    const categoryCount = await prisma.category.count()
    console.log(`📂 Found ${categoryCount} categories in database`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 This usually means:')
      console.log('1. Your Neon database is paused - go to https://console.neon.tech/ and wake it up')
      console.log('2. Check your DATABASE_URL in .env file')
      console.log('3. Make sure your internet connection is working')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection() 