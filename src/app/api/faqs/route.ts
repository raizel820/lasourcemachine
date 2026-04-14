import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/faqs - List FAQs
export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ data: faqs })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}
