import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/partners - List partners
export async function GET() {
  try {
    const partners = await db.partner.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: partners })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

// POST /api/partners - Create partner (admin only)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, logo, website, order } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const partner = await db.partner.create({
      data: {
        name,
        logo: logo || null,
        website: website || null,
        order: order || 0,
      },
    })

    return NextResponse.json({ data: partner }, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}
