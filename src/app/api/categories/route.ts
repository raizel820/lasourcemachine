import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/categories - List all categories with machine count
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { machines: true },
        },
      },
    })

    return NextResponse.json({
      data: categories.map((cat) => ({
        ...cat,
        machineCount: cat._count.machines,
      })),
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
