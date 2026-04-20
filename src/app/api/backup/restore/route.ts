import { NextRequest, NextResponse } from 'next/server';
import { assembleAndRestore } from '@/lib/backup';

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === 'Bearer admin-token';
}

// POST /api/backup/restore - Trigger restore after all chunks uploaded
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run restore in background and return immediately
    // Client will poll /api/backup/status for progress
    assembleAndRestore().catch((error) => {
      console.error('Background restore error:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Restore process started. Poll /api/backup/status for progress.',
    });
  } catch (error) {
    console.error('Restore trigger error:', error);
    return NextResponse.json({ error: 'Failed to start restore' }, { status: 500 });
  }
}
