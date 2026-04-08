import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteUploadedFiles } from '@/lib/file-cleanup'
import { parseImageUrls } from '@/lib/file-cleanup'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/production-lines/[slug] - Get single production line (published for public, any for admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const admin = isAdmin(req)
    const productionLine = await db.productionLine.findFirst({
      where: admin ? { slug } : { slug, status: 'published' },
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

    // Clean up old files if images/cover are being replaced
    const oldFilesToDelete: string[] = []
    if (body.images !== undefined && existing.images !== body.images) {
      oldFilesToDelete.push(existing.images)
    }
    if (body.coverImage !== undefined && existing.coverImage !== body.coverImage) {
      oldFilesToDelete.push(existing.coverImage)
    }

    // Handle machine associations (junction table)
    if (Array.isArray(body.machines)) {
      // Delete existing junction entries
      await db.machineProductionLine.deleteMany({ where: { productionLineId: existing.id } })
      // Create new junction entries with order
      if (body.machines.length > 0) {
        await db.machineProductionLine.createMany({
          data: body.machines.map((m: { machineId: string; order: number }, idx: number) => ({
            machineId: m.machineId,
            productionLineId: existing.id,
            order: m.order ?? idx,
          })),
        })
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
        ...(body.specs !== undefined && { specs: body.specs ?? null }),
        ...(body.basePrice !== undefined && { basePrice: body.basePrice ?? null }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.order !== undefined && { order: body.order }),
      },
      include: {
        machines: {
          include: { machine: { include: { category: true } } },
          orderBy: { order: 'asc' },
        },
      },
    })

    // Delete old uploaded files in background
    if (oldFilesToDelete.length > 0) {
      deleteUploadedFiles(oldFilesToDelete).catch(() => {})
    }

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

    // Delete uploaded files (images, cover)
    await deleteUploadedFiles([existing.images, existing.coverImage])

    await db.productionLine.delete({ where: { slug } })

    return NextResponse.json({ message: 'Production line deleted successfully' })
  } catch (error) {
    console.error('Error deleting production line:', error)
    return NextResponse.json({ error: 'Failed to delete production line' }, { status: 500 })
  }
}
