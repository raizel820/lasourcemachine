import { NextRequest, NextResponse } from 'next/server'

// POST /api/upload - Handle file upload (placeholder)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Placeholder: return the file name as a URL
    // In production, this would upload to R2/S3/etc.
    const fileName = file.name
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const placeholderUrl = `/uploads/${timestamp}-${sanitizedFileName}`

    return NextResponse.json({
      url: placeholderUrl,
      fileName: sanitizedFileName,
      size: file.size,
      type: file.type,
      message: 'File upload placeholder - configure storage backend for production',
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
