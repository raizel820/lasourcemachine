import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Delete uploaded files from disk. Only processes URLs that start with /uploads/
 * (i.e., files that were uploaded through our system, not external URLs).
 *
 * @param urls - Array of URL strings (can be null, undefined, or JSON strings)
 * @returns void — errors are silently caught so DB deletion is never blocked
 */
export async function deleteUploadedFiles(urls: (string | null | undefined)[]) {
  for (const rawUrl of urls) {
    if (!rawUrl) continue;

    // Handle JSON arrays: images field is stored as JSON string like '["/uploads/...","/uploads/..."]'
    let resolvedUrls: string[] = [];
    try {
      const parsed = JSON.parse(rawUrl);
      if (Array.isArray(parsed)) {
        resolvedUrls = parsed.filter((u: unknown) => typeof u === 'string');
      } else if (typeof parsed === 'string') {
        resolvedUrls = [parsed];
      }
    } catch {
      // Not JSON — treat as a single URL string
      resolvedUrls = [rawUrl];
    }

    for (const url of resolvedUrls) {
      if (!url || !url.startsWith('/uploads/')) continue;
      try {
        const fullPath = path.join(process.cwd(), 'public', url);
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch {
        // Silently ignore file deletion errors — never block DB operations
      }
    }
  }
}

/**
 * Extract individual URLs from a JSON array string like '["/uploads/a.jpg","/uploads/b.jpg"]'
 * Returns empty array if not parseable.
 */
export function parseImageUrls(jsonStr: string | null | undefined): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed.filter((u: unknown) => typeof u === 'string');
    return [];
  } catch {
    return [];
  }
}
