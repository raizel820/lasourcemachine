import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import AdmZip from 'adm-zip';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TEMP_DIR = path.join(process.cwd(), '.backup-temp');
const BACKUP_META_FILE = 'backup-meta.json';

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────

export interface BackupMeta {
  version: string;
  createdAt: string;
  tables: { name: string; count: number }[];
  fileCount: number;
  totalFileSize: number;
  appVersion?: string;
}

export interface RestoreProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'restoring_db' | 'restoring_files' | 'complete' | 'error';
  totalChunks: number;
  receivedChunks: number;
  currentStep: string;
  progress: number; // 0-100
  message: string;
  error?: string;
  totalFiles: number;
  restoredFiles: number;
  totalTables: number;
  restoredTables: number;
}

// In-memory restore progress tracker
const restoreProgress: RestoreProgress = {
  status: 'idle',
  totalChunks: 0,
  receivedChunks: 0,
  currentStep: '',
  progress: 0,
  message: '',
  totalFiles: 0,
  restoredFiles: 0,
  totalTables: 0,
  restoredTables: 0,
};

export function getRestoreProgress(): RestoreProgress {
  return { ...restoreProgress };
}

export function resetRestoreProgress(): void {
  restoreProgress.status = 'idle';
  restoreProgress.totalChunks = 0;
  restoreProgress.receivedChunks = 0;
  restoreProgress.currentStep = '';
  restoreProgress.progress = 0;
  restoreProgress.message = '';
  restoreProgress.error = undefined;
  restoreProgress.totalFiles = 0;
  restoreProgress.restoredFiles = 0;
  restoreProgress.totalTables = 0;
  restoreProgress.restoredTables = 0;
}

function updateProgress(partial: Partial<RestoreProgress>): void {
  Object.assign(restoreProgress, partial);
}

// ───────────────────────────────────────
// Table definitions for backup/restore
// ───────────────────────────────────────

interface TableDef {
  name: string;
  fetchAll: () => Promise<unknown[]>;
  // For restore: we need to delete all existing data (with proper order)
  // and then insert the backup data
}

const TABLES_TO_BACKUP: { key: string; model: string }[] = [
  { key: 'admin_users', model: 'adminUser' },
  { key: 'categories', model: 'category' },
  { key: 'machines', model: 'machine' },
  { key: 'production_lines', model: 'productionLine' },
  { key: 'machine_production_lines', model: 'machineProductionLine' },
  { key: 'news_posts', model: 'newsPost' },
  { key: 'projects', model: 'project' },
  { key: 'services', model: 'service' },
  { key: 'partners', model: 'partner' },
  { key: 'faqs', model: 'fAQ' },
  { key: 'leads', model: 'lead' },
  { key: 'site_settings', model: 'siteSetting' },
  { key: 'media', model: 'media' },
];

// Delete order: children first, parents last (respecting foreign keys)
const DELETE_ORDER = [
  'machineProductionLine',
  'lead',
  'media',
  'machine',
  'productionLine',
  'newsPost',
  'project',
  'service',
  'partner',
  'fAQ',
  'category',
  'siteSetting',
  // adminUser is NEVER deleted
];

// Insert order: parents first, children last
const INSERT_ORDER = [
  'adminUser',
  'siteSetting',
  'category',
  'partner',
  'fAQ',
  'service',
  'machine',
  'productionLine',
  'machineProductionLine',
  'newsPost',
  'project',
  'lead',
  'media',
];

// ───────────────────────────────────────
// Helper: collect all files from uploads dir
// ───────────────────────────────────────

async function collectFiles(dir: string, baseDir: string): Promise<{ relativePath: string; absolutePath: string; size: number }[]> {
  const results: { relativePath: string; absolutePath: string; size: number }[] = [];

  if (!fs.existsSync(dir)) return results;

  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = await collectFiles(full, baseDir);
      results.push(...sub);
    } else if (entry.isFile()) {
      const stat = await fsp.stat(full);
      results.push({
        relativePath: path.relative(baseDir, full),
        absolutePath: full,
        size: stat.size,
      });
    }
  }

  return results;
}

// ───────────────────────────────────────
// BACKUP: Generate backup ZIP
// ───────────────────────────────────────

export async function generateBackup(): Promise<NodeJS.ReadableStream> {
  const tables: { name: string; count: number }[] = [];
  const dbDataDir = path.join(TEMP_DIR, 'db-export');

  // Ensure temp dir
  await fsp.mkdir(dbDataDir, { recursive: true });

  try {
    // 1. Export all database tables as JSON
    for (const tableDef of TABLES_TO_BACKUP) {
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const records = await (db as any)[tableDef.model].findMany();
      const cleanData = records.map((r: Record<string, unknown>) => {
        const clean: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(r)) {
          // Convert Date objects to ISO strings for JSON serialization
          if (val instanceof Date) {
            clean[key] = val.toISOString();
          } else {
            clean[key] = val;
          }
        }
        return clean;
      });

      tables.push({ name: tableDef.key, count: cleanData.length });
      const filePath = path.join(dbDataDir, `${tableDef.key}.json`);
      await fsp.writeFile(filePath, JSON.stringify(cleanData, null, 2), 'utf-8');
    }

    // 2. Collect all uploaded files
    const files = await collectFiles(UPLOADS_DIR, UPLOADS_DIR);
    let totalFileSize = 0;
    for (const f of files) totalFileSize += f.size;

    // 3. Create backup metadata
    const meta: BackupMeta = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      tables,
      fileCount: files.length,
      totalFileSize,
    };
    await fsp.writeFile(
      path.join(dbDataDir, BACKUP_META_FILE),
      JSON.stringify(meta, null, 2),
      'utf-8'
    );

    // 4. Create ZIP archive (streaming)
    const { PassThrough } = await import('stream');
    const passThrough = new PassThrough();

    const archive = archiver('zip', {
      zlib: { level: 5 }, // Balance between speed and compression
    });

    archive.pipe(passThrough);

    // Add database export files
    archive.directory(dbDataDir, 'database');

    // Add uploaded files
    if (fs.existsSync(UPLOADS_DIR)) {
      archive.directory(UPLOADS_DIR, 'files/uploads');
    }

    archive.on('error', (err) => {
      console.error('Backup archive error:', err);
      passThrough.destroy(err);
    });

    archive.on('end', () => {
      // Cleanup temp files
      fsp.rm(dbDataDir, { recursive: true, force: true }).catch(() => {});
    });

    archive.finalize();

    return passThrough;
  } catch (error) {
    // Cleanup temp files on error
    await fsp.rm(dbDataDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

// ───────────────────────────────────────
// RESTORE: Chunked file handling
// ───────────────────────────────────────

const CHUNK_DIR = path.join(TEMP_DIR, 'chunks');

export async function saveChunk(chunkIndex: number, totalChunks: number, data: Buffer): Promise<void> {
  await fsp.mkdir(CHUNK_DIR, { recursive: true });

  updateProgress({
    status: 'uploading',
    totalChunks,
    receivedChunks: Math.min(chunkIndex + 1, totalChunks),
    progress: Math.round(((chunkIndex + 1) / totalChunks) * 30), // Upload is 0-30% of progress
    message: `Receiving chunk ${chunkIndex + 1} of ${totalChunks}`,
    currentStep: 'Uploading backup file',
  });

  const chunkPath = path.join(CHUNK_DIR, `chunk_${String(chunkIndex).padStart(5, '0')}`);
  await fsp.writeFile(chunkPath, data);
}

export async function assembleAndRestore(): Promise<void> {
  updateProgress({
    status: 'extracting',
    progress: 30,
    message: 'Assembling chunks...',
    currentStep: 'Assembling uploaded chunks',
  });

  try {
    // 1. Assemble chunks into single file
    const chunkFiles = (await fsp.readdir(CHUNK_DIR))
      .filter(f => f.startsWith('chunk_'))
      .sort();

    if (chunkFiles.length === 0) {
      throw new Error('No chunks received');
    }

    const assembledPath = path.join(TEMP_DIR, 'backup.zip');
    const writeStream = fs.createWriteStream(assembledPath);

    for (const chunkFile of chunkFiles) {
      const chunkData = await fsp.readFile(path.join(CHUNK_DIR, chunkFile));
      writeStream.write(chunkData);
    }
    writeStream.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    updateProgress({
      progress: 35,
      message: 'Extracting backup archive...',
      currentStep: 'Extracting ZIP archive',
    });

    // 2. Extract ZIP
    const zip = new AdmZip(assembledPath);
    const extractDir = path.join(TEMP_DIR, 'extracted');
    await fsp.mkdir(extractDir, { recursive: true });
    zip.extractAllTo(extractDir, true);

    // 3. Read backup metadata
    const metaPath = path.join(extractDir, 'database', BACKUP_META_FILE);
    let meta: BackupMeta | null = null;
    if (fs.existsSync(metaPath)) {
      const metaContent = await fsp.readFile(metaPath, 'utf-8');
      meta = JSON.parse(metaContent);
    }

    // 4. Restore database tables
    await restoreDatabase(extractDir, meta);

    // 5. Restore files in batches
    await restoreFiles(extractDir);

    // 6. Cleanup
    await cleanup(assembledPath, extractDir);

    updateProgress({
      status: 'complete',
      progress: 100,
      message: 'Backup restored successfully!',
      currentStep: 'Complete',
    });
  } catch (error) {
    console.error('Restore error:', error);
    updateProgress({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown restore error',
      message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currentStep: 'Error',
    });
    // Cleanup on error
    try {
      const assembledPath = path.join(TEMP_DIR, 'backup.zip');
      const extractDir = path.join(TEMP_DIR, 'extracted');
      await cleanup(assembledPath, extractDir);
    } catch {}
    throw error;
  }
}

async function restoreDatabase(extractDir: string, meta: BackupMeta | null): Promise<void> {
  const dbDir = path.join(extractDir, 'database');
  updateProgress({
    status: 'restoring_db',
    progress: 40,
    message: 'Restoring database tables...',
    currentStep: 'Restoring database',
    totalTables: meta?.tables?.length || INSERT_ORDER.length,
    restoredTables: 0,
  });

  // 1. Delete all data in proper order (respecting foreign keys)
  for (const model of DELETE_ORDER) {
    try {
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any)[model].deleteMany({});
    } catch (error) {
      console.warn(`Failed to clear ${model}:`, error);
    }
  }

  // 2. Insert data in proper order (parents first)
  let restoredCount = 0;
  for (const model of INSERT_ORDER) {
    const key = modelToFileName(model);
    const filePath = path.join(dbDir, `${key}.json`);

    if (!fs.existsSync(filePath)) {
      restoredCount++;
      updateProgress({
        restoredTables: restoredCount,
        message: `Skipped ${key} (no data in backup)`,
      });
      continue;
    }

    try {
      const raw = await fsp.readFile(filePath, 'utf-8');
      const records: Record<string, unknown>[] = JSON.parse(raw);

      if (records.length === 0) {
        restoredCount++;
        updateProgress({
          restoredTables: restoredCount,
          message: `Restored ${key} (0 records)`,
        });
        continue;
      }

      // Process records: convert ISO date strings back to Date objects
      const processed = records.map(record => {
        const processed: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(record)) {
          if (typeof v === 'string' && isDateString(v)) {
            processed[k] = new Date(v);
          } else {
            processed[k] = v;
          }
        }
        return processed;
      });

      // Insert in batches of 50 to avoid overloading
      const BATCH_SIZE = 50;
      for (let i = 0; i < processed.length; i += BATCH_SIZE) {
        const batch = processed.slice(i, i + BATCH_SIZE);
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any)[model].createMany({
          data: batch as Prisma.Enumerable<Prisma.Args<any, 'createMany'>['data']>,
          skipDuplicates: true,
        });
      }

      restoredCount++;
      const dbProgress = 40 + Math.round((restoredCount / INSERT_ORDER.length) * 30);
      updateProgress({
        restoredTables: restoredCount,
        progress: dbProgress,
        message: `Restored ${key} (${records.length} records)`,
      });
    } catch (error) {
      console.error(`Failed to restore ${key}:`, error);
      restoredCount++;
      updateProgress({
        restoredTables: restoredCount,
        message: `Warning: Failed to restore ${key}`,
      });
    }
  }
}

async function restoreFiles(extractDir: string): Promise<void> {
  const filesDir = path.join(extractDir, 'files');
  updateProgress({
    status: 'restoring_files',
    progress: 70,
    message: 'Restoring uploaded files...',
    currentStep: 'Restoring files',
    restoredFiles: 0,
  });

  if (!fs.existsSync(filesDir)) {
    updateProgress({
      progress: 100,
      message: 'No files to restore',
      restoredFiles: 0,
      totalFiles: 0,
    });
    return;
  }

  const files = await collectFiles(filesDir, filesDir);
  updateProgress({ totalFiles: files.length });

  // Process files in batches of 20
  const BATCH_SIZE = 20;
  let restoredCount = 0;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const destPath = path.join(UPLOADS_DIR, file.relativePath);
          await fsp.mkdir(path.dirname(destPath), { recursive: true });
          await fsp.copyFile(file.absolutePath, destPath);
          restoredCount++;
        } catch (error) {
          console.warn(`Failed to restore file ${file.relativePath}:`, error);
        }
      })
    );

    const fileProgress = 70 + Math.round((Math.min(i + BATCH_SIZE, files.length) / files.length) * 30);
    updateProgress({
      restoredFiles: restoredCount,
      progress: fileProgress,
      message: `Restoring files: ${Math.min(i + BATCH_SIZE, files.length)} of ${files.length}`,
    });
  }

  updateProgress({
    restoredFiles: restoredCount,
    progress: 100,
    message: `Restored ${restoredCount} of ${files.length} files`,
  });
}

function modelToFileName(model: string): string {
  const map: Record<string, string> = {
    adminUser: 'admin_users',
    category: 'categories',
    machine: 'machines',
    productionLine: 'production_lines',
    machineProductionLine: 'machine_production_lines',
    newsPost: 'news_posts',
    project: 'projects',
    service: 'services',
    partner: 'partners',
    fAQ: 'faqs',
    lead: 'leads',
    siteSetting: 'site_settings',
    media: 'media',
  };
  return map[model] || model;
}

function isDateString(value: string): boolean {
  // Check if string matches ISO date format
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

async function cleanup(...dirs: string[]): Promise<void> {
  await Promise.all(
    dirs.map(dir => fsp.rm(dir, { recursive: true, force: true }).catch(() => {}))
  );
  // Also cleanup chunks
  await fsp.rm(CHUNK_DIR, { recursive: true, force: true }).catch(() => {});
}

// ───────────────────────────────────────
// RESET: Clear all data except admin user
// ───────────────────────────────────────

export async function resetApp(): Promise<{ deletedRecords: Record<string, number>; deletedFiles: number }> {
  const deletedRecords: Record<string, number> = {};
  let deletedFiles = 0;

  // 1. Delete all data from all tables except AdminUser
  for (const model of DELETE_ORDER) {
    try {
      // // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (db as any)[model].deleteMany({});
      deletedRecords[model] = result.count;
    } catch (error) {
      console.warn(`Failed to clear ${model} during reset:`, error);
      deletedRecords[model] = 0;
    }
  }

  // 2. Delete all uploaded files
  if (fs.existsSync(UPLOADS_DIR)) {
    try {
      const files = await collectFiles(UPLOADS_DIR, UPLOADS_DIR);
      for (const file of files) {
        try {
          await fsp.unlink(file.absolutePath);
          deletedFiles++;
        } catch {
          // Ignore individual file errors
        }
      }
    } catch {
      // If collecting fails, try direct removal
    }
  }

  // 3. Recreate empty upload subdirectories
  const subdirs = [
    'branding', 'machines', 'news', 'partners',
    'production-lines', 'projects', 'services', 'settings',
  ];
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  for (const subdir of subdirs) {
    await fsp.mkdir(path.join(UPLOADS_DIR, subdir), { recursive: true });
  }

  return { deletedRecords, deletedFiles };
}

// ───────────────────────────────────────
// Cleanup temp directory (for maintenance)
// ───────────────────────────────────────

export async function cleanupTemp(): Promise<void> {
  await fsp.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
}
