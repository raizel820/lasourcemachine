import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/production-lines/[slug] - Get single published production line
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const productionLine = await db.productionLine.findFirst({
      where: { slug, status: 'published' },
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
    })

    if (!productionLine) {
      return NextResponse.json({ error: 'Production line not found' }, { status: 404 })
    }

    return NextResponse.json({ data: productionLine })
  } catch (error) {
    console.error('Error fetching production line:', error)
    return NextResponse.json({ error: 'Failed to fetch production line' }, { status: 500 })
  }
}

// PUT /api/production-lines/[slug] - Update production line (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()

    const existing = await db.productionLine.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Production line not found' }, { status: 404 })
    }

    if (body.slug && body.slug !== slug) {
      const slugExists = await db.productionLine.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Production line with this slug already exists' }, { status: 409 })
      }
    }

    const productionLine = await db.productionLine.update({
      where: { slug },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc ?? null }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage ?? null }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    return NextResponse.json({ data: productionLine })
  } catch (error) {
    console.error('Error updating production line:', error)
    return NextResponse.json({ error: 'Failed to update production line' }, { status: 500 })
  }
}

// DELETE /api/production-lines/[slug] - Delete production line (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const existing = await db.productionLine.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Production line not found' }, { status: 404 })
    }

    // Delete junction table entries first
    await db.machineProductionLine.deleteMany({ where: { productionLineId: existing.id } })

    await db.productionLine.delete({ where: { slug } })

    return NextResponse.json({ message: 'Production line deleted successfully' })
  } catch (error) {
    console.error('Error deleting production line:', error)
    return NextResponse.json({ error: 'Failed to delete production line' }, { status: 500 })
  }
}
