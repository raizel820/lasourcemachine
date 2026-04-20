import { NextRequest, NextResponse } from 'next/server';
import { getRestoreProgress, resetRestoreProgress, cleanupTemp } from '@/lib/backup';

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === 'Bearer admin-token';
}

// GET /api/backup/status - Get restore progress
export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = getRestoreProgress();
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

// DELETE /api/backup/status - Reset status (e.g., after restore complete or error)
export async function DELETE(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    resetRestoreProgress();
    await cleanupTemp();
    return NextResponse.json({ success: true, message: 'Status reset' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset status' }, { status: 500 });
  }
}
