import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create roles
  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: { name: "superadmin" },
  })

  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  })

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  })

  console.log("✅ Roles created")

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 12)

  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      fullName: "Demo Superadmin",
      passwordHash: hashedPassword,
      roleId: superadminRole.id,
      darkMode: false,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "Demo Admin",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      darkMode: true,
      createdById: superadmin.id,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      fullName: "Demo User",
      passwordHash: hashedPassword,
      roleId: userRole.id,
      darkMode: false,
    },
  })

  console.log("✅ Users created")

  // Create categories
  const techCategory = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: {
      name: "Technology",
      slug: "technology",
      description: "Latest tech trends and innovations",
      color: "#3B82F6",
    },
  })

  const designCategory = await prisma.category.upsert({
    where: { slug: "design" },
    update: {},
    create: {
      name: "Design",
      slug: "design",
      description: "UI/UX design and creative inspiration",
      color: "#8B5CF6",
    },
  })

  const businessCategory = await prisma.category.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "Business",
      slug: "business",
      description: "Business strategies and entrepreneurship",
      color: "#10B981",
    },
  })

  console.log("✅ Categories created")

  // Create tags
  const reactTag = await prisma.tag.upsert({
    where: { slug: "react" },
    update: {},
    create: {
      name: "React",
      slug: "react",
    },
  })

  const nextjsTag = await prisma.tag.upsert({
    where: { slug: "nextjs" },
    update: {},
    create: {
      name: "Next.js",
      slug: "nextjs",
    },
  })

  const uiuxTag = await prisma.tag.upsert({
    where: { slug: "ui-ux" },
    update: {},
    create: {
      name: "UI/UX",
      slug: "ui-ux",
    },
  })

  const startupTag = await prisma.tag.upsert({
    where: { slug: "startup" },
    update: {},
    create: {
      name: "Startup",
      slug: "startup",
    },
  })

  console.log("✅ Tags created")

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      title: "The Future of Web Development with Next.js",
      slug: "future-of-web-development-nextjs",
      content: `
        <h2>Introduction</h2>
        <p>Web development is constantly evolving, and Next.js has emerged as one of the most powerful frameworks for building modern web applications. In this article, we'll explore the latest features and trends that are shaping the future of web development.</p>
        
        <h2>Key Features of Next.js</h2>
        <p>Next.js offers several compelling features that make it an excellent choice for developers:</p>
        <ul>
          <li>Server-side rendering (SSR) and static site generation (SSG)</li>
          <li>Automatic code splitting for optimal performance</li>
          <li>Built-in CSS and Sass support</li>
          <li>API routes for full-stack development</li>
          <li>Image optimization out of the box</li>
        </ul>
        
        <h2>The Road Ahead</h2>
        <p>As we look to the future, Next.js continues to innovate with features like the App Router, Server Components, and improved developer experience. These advancements are making it easier than ever to build fast, scalable web applications.</p>
      `,
      excerpt:
        "Exploring the latest trends and technologies shaping the future of web development with Next.js framework.",
      status: "published",
      authorId: admin.id,
      categoryId: techCategory.id,
      publishedAt: new Date(),
    },
  })

  const post2 = await prisma.post.create({
    data: {
      title: "Modern UI/UX Design Principles for 2024",
      slug: "modern-ui-ux-design-principles-2024",
      content: `
        <h2>The Evolution of Design</h2>
        <p>User interface and user experience design have evolved significantly over the past few years. As we enter 2024, new principles and trends are emerging that prioritize accessibility, sustainability, and user-centered design.</p>
        
        <h2>Key Principles</h2>
        <p>Here are the most important design principles to follow in 2024:</p>
        <ol>
          <li><strong>Accessibility First:</strong> Design for all users, including those with disabilities</li>
          <li><strong>Sustainable Design:</strong> Consider the environmental impact of your design choices</li>
          <li><strong>Micro-interactions:</strong> Small animations that enhance user experience</li>
          <li><strong>Dark Mode:</strong> Provide options for different viewing preferences</li>
          <li><strong>Minimalism:</strong> Focus on essential elements and reduce clutter</li>
        </ol>
        
        <h2>Implementation Tips</h2>
        <p>To implement these principles effectively, start with user research, create inclusive design systems, and continuously test with real users. Remember that great design is not just about aesthetics—it's about solving problems and creating meaningful experiences.</p>
      `,
      excerpt: "Discover the latest design trends that are shaping user experiences in 2024 and beyond.",
      status: "published",
      authorId: admin.id,
      categoryId: designCategory.id,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  })

  const post3 = await prisma.post.create({
    data: {
      title: "Building a Successful Startup: Lessons from the Trenches",
      slug: "building-successful-startup-lessons",
      content: `
        <h2>The Startup Journey</h2>
        <p>Starting a business is one of the most challenging yet rewarding experiences an entrepreneur can undertake. After building and scaling multiple startups, I've learned valuable lessons that I want to share with aspiring entrepreneurs.</p>
        
        <h2>Essential Lessons</h2>
        <p>Here are the key lessons I've learned:</p>
        <ul>
          <li><strong>Validate Early:</strong> Test your idea with real customers before building</li>
          <li><strong>Focus on Product-Market Fit:</strong> Don't scale until you've found it</li>
          <li><strong>Build a Strong Team:</strong> Hire people who complement your skills</li>
          <li><strong>Manage Cash Flow:</strong> Keep a close eye on your finances</li>
          <li><strong>Stay Customer-Focused:</strong> Always prioritize customer needs</li>
        </ul>
        
        <h2>Common Pitfalls</h2>
        <p>Avoid these common mistakes that can derail your startup:</p>
        <ul>
          <li>Building features nobody wants</li>
          <li>Hiring too fast or too slow</li>
          <li>Ignoring unit economics</li>
          <li>Trying to do everything yourself</li>
          <li>Not listening to customer feedback</li>
        </ul>
        
        <h2>Final Thoughts</h2>
        <p>Remember, building a startup is a marathon, not a sprint. Stay persistent, learn from failures, and celebrate small wins along the way. Success rarely happens overnight, but with dedication and the right approach, you can build something amazing.</p>
      `,
      excerpt:
        "Essential strategies and insights for building and scaling a successful startup from experienced entrepreneurs.",
      status: "published",
      authorId: superadmin.id,
      categoryId: businessCategory.id,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  })

  console.log("✅ Posts created")

  // Create post-tag relationships
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: reactTag.id },
      { postId: post1.id, tagId: nextjsTag.id },
      { postId: post2.id, tagId: uiuxTag.id },
      { postId: post3.id, tagId: startupTag.id },
    ],
  })

  console.log("✅ Post-tag relationships created")

  // Create sample analytics data
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)

  await prisma.postAnalytic.createMany({
    data: [
      // Post 1 analytics
      {
        postId: post1.id,
        date: today,
        viewsCount: 45,
        likesCount: 12,
        commentsCount: 3,
      },
      {
        postId: post1.id,
        date: yesterday,
        viewsCount: 38,
        likesCount: 8,
        commentsCount: 2,
      },
      // Post 2 analytics
      {
        postId: post2.id,
        date: today,
        viewsCount: 32,
        likesCount: 15,
        commentsCount: 5,
      },
      {
        postId: post2.id,
        date: yesterday,
        viewsCount: 28,
        likesCount: 10,
        commentsCount: 4,
      },
      // Post 3 analytics
      {
        postId: post3.id,
        date: today,
        viewsCount: 67,
        likesCount: 23,
        commentsCount: 8,
      },
      {
        postId: post3.id,
        date: yesterday,
        viewsCount: 54,
        likesCount: 18,
        commentsCount: 6,
      },
      {
        postId: post3.id,
        date: twoDaysAgo,
        viewsCount: 41,
        likesCount: 12,
        commentsCount: 4,
      },
    ],
  })

  console.log("✅ Analytics data created")

  // Create sample comments
  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        authorId: user.id,
        content: "Great article! I've been using Next.js for a while now and it's amazing how much it has evolved.",
      },
      {
        postId: post1.id,
        authorId: superadmin.id,
        content: "Thanks for sharing this comprehensive overview. The App Router is definitely a game-changer.",
      },
      {
        postId: post2.id,
        authorId: user.id,
        content:
          "These design principles are spot on. Accessibility should definitely be a priority for all designers.",
      },
      {
        postId: post3.id,
        authorId: admin.id,
        content: "As someone who's been through the startup journey, I can confirm these lessons are invaluable.",
      },
    ],
  })

  console.log("✅ Comments created")

  // Create sample likes
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: user.id },
      { postId: post1.id, userId: superadmin.id },
      { postId: post2.id, userId: user.id },
      { postId: post2.id, userId: admin.id },
      { postId: post3.id, userId: user.id },
      { postId: post3.id, userId: admin.id },
    ],
  })

  console.log("✅ Likes created")

  console.log("🎉 Database seeded successfully!")
  console.log("\n📝 Demo accounts:")
  console.log("Superadmin: superadmin@example.com / password123")
  console.log("Admin: admin@example.com / password123")
  console.log("User: user@example.com / password123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
