import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/production-lines - List published production lines
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const skip = (page - 1) * limit

    const statusParam = searchParams.get('status') || 'published'
    const where: Record<string, unknown> = statusParam === 'all' ? {} : { status: statusParam }

    const [productionLines, total] = await Promise.all([
      db.productionLine.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
        include: {
          machines: {
            include: {
              machine: {
                include: { category: true },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      }),
      db.productionLine.count({ where }),
    ])

    return NextResponse.json({
      data: productionLines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching production lines:', error)
    return NextResponse.json({ error: 'Failed to fetch production lines' }, { status: 500 })
  }
}

// POST /api/production-lines - Create production line (admin only)
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
      images,
      coverImage,
      specs,
      basePrice,
      currency,
      featured,
      status,
      order,
    } = body

    if (!name || !slug || !description) {
      return NextResponse.json({ error: 'name, slug, and description are required' }, { status: 400 })
    }

    const existing = await db.productionLine.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Production line with this slug already exists' }, { status: 409 })
    }

    const productionLine = await db.productionLine.create({
      data: {
        name,
        slug,
        description,
        shortDesc: shortDesc || null,
        images: images || '[]',
        coverImage: coverImage || null,
        specs: specs || null,
        basePrice: basePrice ?? null,
        currency: currency || 'DZD',
        featured: featured || false,
        status: status || 'draft',
        order: order || 0,
      },
    })

    // Handle machine associations (junction table)
    if (Array.isArray(body.machines) && body.machines.length > 0) {
      await db.machineProductionLine.createMany({
        data: body.machines.map((m: { machineId: string; order: number }, idx: number) => ({
          machineId: m.machineId,
          productionLineId: productionLine.id,
          order: m.order ?? idx,
        })),
      })
    }

    return NextResponse.json({ data: productionLine }, { status: 201 })
  } catch (error) {
    console.error('Error creating production line:', error)
    return NextResponse.json({ error: 'Failed to create production line' }, { status: 500 })
  }
}
