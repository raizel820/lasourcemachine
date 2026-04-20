import { NextRequest, NextResponse } from 'next/server';
import { saveChunk, resetRestoreProgress, getRestoreProgress } from '@/lib/backup';

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === 'Bearer admin-token';
}

// POST /api/backup/upload-chunk - Upload a chunk of the backup file
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chunkIndex = parseInt(req.headers.get('x-chunk-index') || '0', 10);
    const totalChunks = parseInt(req.headers.get('x-total-chunks') || '1', 10);

    if (isNaN(chunkIndex) || isNaN(totalChunks) || chunkIndex < 0 || totalChunks < 1) {
      return NextResponse.json({ error: 'Invalid chunk parameters' }, { status: 400 });
    }

    const data = await req.arrayBuffer();
    await saveChunk(chunkIndex, totalChunks, Buffer.from(data));

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      progress: getRestoreProgress().progress,
      message: `Chunk ${chunkIndex + 1} of ${totalChunks} received`,
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json({ error: 'Failed to upload chunk' }, { status: 500 });
  }
}

// DELETE /api/backup/upload-chunk - Cancel/reset chunk upload
export async function DELETE(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resetRestoreProgress();
    // Cleanup chunks directory
    const { promisify } = await import('util');
    const { exec } = await import('child_process');
    const execAsync = promisify(exec);
    await execAsync(`rm -rf ${process.cwd()}/.backup-temp/chunks`).catch(() => {});

    return NextResponse.json({ success: true, message: 'Upload cancelled' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel upload' }, { status: 500 });
  }
}
