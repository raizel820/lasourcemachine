import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteUploadedFiles } from '@/lib/file-cleanup'
import { parseImageUrls } from '@/lib/file-cleanup'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/machines/[slug] - Get single published machine
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const machine = await db.machine.findFirst({
      where: { slug, status: 'published' },
      include: {
        category: true,
        productionLines: {
          include: {
            productionLine: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    return NextResponse.json({ data: machine })
  } catch (error) {
    console.error('Error fetching machine:', error)
    return NextResponse.json({ error: 'Failed to fetch machine' }, { status: 500 })
  }
}

// PUT /api/machines/[slug] - Update machine (admin only)
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

    const existing = await db.machine.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== slug) {
      const slugExists = await db.machine.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Machine with this slug already exists' }, { status: 409 })
      }
    }

    // Clean up old files if images/cover/pdf are being replaced
    const oldFilesToDelete: string[] = []
    if (body.images !== undefined && existing.images !== body.images) {
      oldFilesToDelete.push(existing.images)
    }
    if (body.coverImage !== undefined && existing.coverImage !== body.coverImage) {
      oldFilesToDelete.push(existing.coverImage)
    }
    if (body.pdfUrl !== undefined && existing.pdfUrl !== body.pdfUrl) {
      oldFilesToDelete.push(existing.pdfUrl)
    }

    const machine = await db.machine.update({
      where: { slug },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.shortDesc !== undefined && { shortDesc: body.shortDesc ?? null }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId ?? null }),
        ...(body.specs !== undefined && { specs: body.specs ?? null }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage ?? null }),
        ...(body.pdfUrl !== undefined && { pdfUrl: body.pdfUrl ?? null }),
        ...(body.basePrice !== undefined && { basePrice: body.basePrice ? parseFloat(body.basePrice) : null }),
        ...(body.currency !== undefined && { currency: body.currency }),
        ...(body.featured !== undefined && { featured: body.featured }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.machineType !== undefined && { machineType: body.machineType ?? null }),
        ...(body.capacity !== undefined && { capacity: body.capacity ?? null }),
      },
      include: { category: true },
    })

    // Delete old uploaded files in background (don't block response)
    if (oldFilesToDelete.length > 0) {
      deleteUploadedFiles(oldFilesToDelete).catch(() => {})
    }

    return NextResponse.json({ data: machine })
  } catch (error) {
    console.error('Error updating machine:', error)
    return NextResponse.json({ error: 'Failed to update machine' }, { status: 500 })
  }
}

// DELETE /api/machines/[slug] - Delete machine (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const existing = await db.machine.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // Delete junction table entries first
    await db.machineProductionLine.deleteMany({ where: { machineId: existing.id } })

    // Delete uploaded files (images, cover, PDF)
    await deleteUploadedFiles([existing.images, existing.coverImage, existing.pdfUrl])

    await db.machine.delete({ where: { slug } })

    return NextResponse.json({ message: 'Machine deleted successfully' })
  } catch (error) {
    console.error('Error deleting machine:', error)
    return NextResponse.json({ error: 'Failed to delete machine' }, { status: 500 })
  }
}
