const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCategories() {
  try {
    console.log('🌱 Seeding categories...')

    const categories = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest tech trends and innovations',
        color: '#3B82F6'
      },
      {
        name: 'Programming',
        slug: 'programming',
        description: 'Software development and coding tutorials',
        color: '#10B981'
      },
      {
        name: 'Design',
        slug: 'design',
        description: 'UI/UX design and creative inspiration',
        color: '#8B5CF6'
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business strategies and entrepreneurship',
        color: '#F59E0B'
      },
      {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Frontend and backend web development',
        color: '#EF4444'
      },
      {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Machine learning and data analytics',
        color: '#06B6D4'
      }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      })
    }

    console.log('✅ Categories seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories() 