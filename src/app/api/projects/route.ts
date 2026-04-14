import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/projects - List published projects
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const skip = (page - 1) * limit

    const statusParam = searchParams.get('status') || 'published'
    const where: Record<string, unknown> = statusParam === 'all' ? {} : { status: statusParam }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      db.project.count({ where }),
    ])

    return NextResponse.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create project (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      slug,
      description,
      content,
      coverImage,
      images,
      client,
      location,
      date,
      status,
      order,
    } = body

    if (!title || !slug || !description) {
      return NextResponse.json({ error: 'title, slug, and description are required' }, { status: 400 })
    }

    const existing = await db.project.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 409 })
    }

    const project = await db.project.create({
      data: {
        title,
        slug,
        description,
        content: content || null,
        coverImage: coverImage || null,
        images: images || '[]',
        client: client || null,
        location: location || null,
        date: date || null,
        status: status || 'draft',
        order: order || 0,
      },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
