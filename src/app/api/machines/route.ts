import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/machines - List published machines with filters and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'published'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { status }

    if (category) {
      where.category = { slug: category }
    }
    if (type) {
      where.machineType = type
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (search) {
      where.name = { contains: search }
    }

    const [machines, total] = await Promise.all([
      db.machine.findMany({
        where,
        include: { category: true },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      db.machine.count({ where }),
    ])

    return NextResponse.json({
      data: machines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching machines:', error)
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 })
  }
}

// POST /api/machines - Create machine (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      slug,
      description,
      shortDesc,
      categoryId,
      specs,
      images,
      coverImage,
      pdfUrl,
      basePrice,
      currency,
      featured,
      status,
      order,
      machineType,
      capacity,
    } = body

    if (!name || !slug || !description) {
      return NextResponse.json({ error: 'name, slug, and description are required' }, { status: 400 })
    }

    const existing = await db.machine.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Machine with this slug already exists' }, { status: 409 })
    }

    const machine = await db.machine.create({
      data: {
        name,
        slug,
        description,
        shortDesc: shortDesc || null,
        categoryId: categoryId || null,
        specs: specs || null,
        images: images || '[]',
        coverImage: coverImage || null,
        pdfUrl: pdfUrl || null,
        basePrice: basePrice ? parseFloat(basePrice) : null,
        currency: currency || 'DZD',
        featured: featured || false,
        status: status || 'draft',
        order: order || 0,
        machineType: machineType || null,
        capacity: capacity || null,
      },
      include: { category: true },
    })

    return NextResponse.json({ data: machine }, { status: 201 })
  } catch (error) {
    console.error('Error creating machine:', error)
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 })
  }
}
