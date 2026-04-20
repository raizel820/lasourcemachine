import { NextRequest, NextResponse } from 'next/server';
import { resetApp } from '@/lib/backup';

// Admin auth helper
function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  return auth === 'Bearer admin-token';
}

// POST /api/backup/reset - Reset app to initial state (keep admin credentials)
export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await resetApp();

    return NextResponse.json({
      success: true,
      message: 'App reset successfully. All data cleared except admin credentials.',
      deletedRecords: result.deletedRecords,
      deletedFiles: result.deletedFiles,
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset app', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
