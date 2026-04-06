import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/projects/[slug] - Get single project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const project = await db.project.findFirst({
      where: { slug, status: 'published' },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

// PUT /api/projects/[slug] - Update project (admin only)
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

    const existing = await db.project.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (body.slug && body.slug !== slug) {
      const slugExists = await db.project.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 409 })
      }
    }

    const project = await db.project.update({
      where: { slug },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content !== undefined && { content: body.content ?? null }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage ?? null }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.client !== undefined && { client: body.client ?? null }),
        ...(body.location !== undefined && { location: body.location ?? null }),
        ...(body.date !== undefined && { date: body.date ?? null }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[slug] - Delete project (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const existing = await db.project.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    await db.project.delete({ where: { slug } })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
