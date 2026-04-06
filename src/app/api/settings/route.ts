import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === 'Bearer admin-token'
}

// GET /api/settings - Get all settings as key-value object
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ data: settingsMap })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const settings: Record<string, string> = body.settings || body

    if (typeof settings !== 'object' || Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings must be a key-value object' }, { status: 400 })
    }

    // Upsert each setting
    const upsertPromises = Object.entries(settings).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await Promise.all(upsertPromises)

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
