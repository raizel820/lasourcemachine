import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from '@/lib/constants';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = fileName.replace(ext, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${baseName}${ext}`;
}

// POST /api/upload - Handle file upload (saves to public/uploads/)
export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allAllowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" is not allowed. Allowed: images (jpeg, png, webp, gif, svg) and PDF documents.` },
        { status: 400 }
      );
    }

    // Create unique file name
    const sanitizedFileName = sanitizeFileName(file.name);
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
    const folderPath = path.join(UPLOAD_DIR, folder);

    // Ensure sub-folder exists
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, uniqueFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Return the public URL path
    const url = `/uploads/${folder}/${uniqueFileName}`;

    return NextResponse.json({
      url,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// DELETE /api/upload - Delete uploaded file
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('url');

    if (!filePath || !filePath.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const fullPath = path.join(process.cwd(), 'public', filePath);
    const { unlink } = await import('fs/promises');

    if (existsSync(fullPath)) {
      await unlink(fullPath);
      return NextResponse.json({ message: 'File deleted successfully' });
    }

    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
