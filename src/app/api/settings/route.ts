import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteUploadedFiles } from '@/lib/file-cleanup'

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

    // Settings that contain uploaded file URLs — delete old files when they change
    const fileSettingsKeys = ['company_logo', 'company_favicon', 'seo_og_image']
    const oldValues: Record<string, string> = {}

    for (const key of fileSettingsKeys) {
      if (settings[key] !== undefined) {
        const old = await db.siteSetting.findUnique({ where: { key } })
        if (old && old.value && old.value !== settings[key]) {
          oldValues[key] = old.value
        }
      }
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

    // Delete old uploaded files that were replaced
    const oldFileUrls = Object.values(oldValues).filter(Boolean)
    if (oldFileUrls.length > 0) {
      await deleteUploadedFiles(oldFileUrls)
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
