import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/services - List services (published by default, all for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status') || 'published'
    const where: Record<string, unknown> = statusParam === 'all' ? {} : { status: statusParam }

    const services = await db.service.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: services })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST /api/services - Create service (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, icon, features, image, order, status } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        title,
        description,
        icon: icon || null,
        features: features || null,
        image: image || null,
        order: order || 0,
        status: status || 'draft',
      },
    })

    return NextResponse.json({ data: service }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
