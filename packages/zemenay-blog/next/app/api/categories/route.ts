import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "zemenay-blog/next/lib/prisma"

export async function GET(_request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const response = NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || `Explore ${category.name} related content`,
        color: category.color,
        _count: category._count,
      })),
    })

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error) {
    console.error('[zemenay-blog] Categories error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, slug, description, color } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const existingCategory = await prisma.category.findUnique({ where: { slug } })
    if (existingCategory) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: { name, slug, description, color: color || '#3B82F6' },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[zemenay-blog] Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}


