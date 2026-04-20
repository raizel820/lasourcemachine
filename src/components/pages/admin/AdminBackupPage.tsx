'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  HardDrive,
  Database,
  FileArchive,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ADMIN_HEADERS = { Authorization: 'Bearer admin-token' };
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

interface BackupInfo {
  tables: { name: string; count: number }[];
  files: { count: number; totalSize: number };
}

interface RestoreProgress {
  status: 'idle' | 'uploading' | 'extracting' | 'restoring_db' | 'restoring_files' | 'complete' | 'error';
  totalChunks: number;
  receivedChunks: number;
  currentStep: string;
  progress: number;
  message: string;
  error?: string;
  totalFiles: number;
  restoredFiles: number;
  totalTables: number;
  restoredTables: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatTableName(name: string): string {
  return name
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AdminBackupPage() {
  // Backup info state
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [generatingBackup, setGeneratingBackup] = useState(false);

  // Restore state
  const [restoreProgress, setRestoreProgress] = useState<RestoreProgress>({
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
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state
  const [resetting, setResetting] = useState(false);

  // Fetch backup info
  const fetchBackupInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...ADMIN_HEADERS },
        body: JSON.stringify({ action: 'info' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBackupInfo(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    fetchBackupInfo();
  }, [fetchBackupInfo]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // ── Backup: Download ──
  const handleDownloadBackup = async () => {
    setGeneratingBackup(true);
    try {
      const res = await fetch('/api/backup', {
        headers: ADMIN_HEADERS,
      });
      if (!res.ok) {
        throw new Error('Failed to generate backup');
      }

      // Trigger file download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('content-disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      a.download = filenameMatch?.[1] || `lasource-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup downloaded successfully!');
      fetchBackupInfo(); // Refresh info
    } catch (error) {
      console.error('Backup download error:', error);
      toast.error('Failed to generate backup');
    } finally {
      setGeneratingBackup(false);
    }
  };

  // ── Restore: File selection ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error('Please select a .zip backup file');
        return;
      }
      setSelectedFile(file);
    }
  };

  // ── Restore: Upload chunks ──
  const handleRestore = async () => {
    if (!selectedFile) return;

    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);

    setRestoreProgress({
      status: 'uploading',
      totalChunks,
      receivedChunks: 0,
      currentStep: 'Uploading backup file',
      progress: 0,
      message: `Starting upload of ${formatBytes(selectedFile.size)}...`,
      totalFiles: 0,
      restoredFiles: 0,
      totalTables: 0,
      restoredTables: 0,
    });

    try {
      // Upload in chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
        const chunk = selectedFile.slice(start, end);

        const res = await fetch('/api/backup/upload-chunk', {
          method: 'POST',
          headers: {
            ...ADMIN_HEADERS,
            'x-chunk-index': String(i),
            'x-total-chunks': String(totalChunks),
            'Content-Type': 'application/octet-stream',
          },
          body: chunk,
        });

        if (!res.ok) {
          throw new Error(`Chunk ${i + 1} upload failed`);
        }
      }

      // Start restore process
      setRestoreProgress(prev => ({
        ...prev,
        message: 'All chunks uploaded. Starting restore...',
      }));

      const restoreRes = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: ADMIN_HEADERS,
      });

      if (!restoreRes.ok) {
        throw new Error('Failed to start restore');
      }

      // Start polling for progress
      startProgressPolling();
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Restore failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setRestoreProgress(prev => ({
        ...prev,
        status: 'error',
        message: 'Restore failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      cancelRestore();
    }
  };

  // ── Restore: Progress polling ──
  const startProgressPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/backup/status', { headers: ADMIN_HEADERS });
        if (res.ok) {
          const progress: RestoreProgress = await res.json();
          setRestoreProgress(progress);

          if (progress.status === 'complete') {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            toast.success('Backup restored successfully! All data and files have been recovered.');
            fetchBackupInfo();
            // Reset after 3 seconds
            setTimeout(() => {
              setRestoreProgress({
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
              });
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
              // Cleanup server-side status
              fetch('/api/backup/status', { method: 'DELETE', headers: ADMIN_HEADERS }).catch(() => {});
            }, 3000);
          } else if (progress.status === 'error') {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            toast.error('Restore failed: ' + (progress.error || 'Unknown error'));
            cancelRestore();
          }
        }
      } catch {
        // Continue polling
      }
    }, 500);
  };

  // ── Restore: Cancel ──
  const cancelRestore = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    fetch('/api/backup/upload-chunk', { method: 'DELETE', headers: ADMIN_HEADERS }).catch(() => {});
    fetch('/api/backup/status', { method: 'DELETE', headers: ADMIN_HEADERS }).catch(() => {});
    setRestoreProgress({
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
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Reset ──
  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/backup/reset', {
        method: 'POST',
        headers: ADMIN_HEADERS,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('App reset successfully! All data and files have been cleared.');
        fetchBackupInfo();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Reset failed');
      }
    } catch {
      toast.error('Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const totalRecords = backupInfo?.tables.reduce((sum, t) => sum + t.count, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
        <p className="text-muted-foreground">
          Generate backups, restore from backup files, or reset the application
        </p>
      </div>

      {/* Overview Stats */}
      {loadingInfo ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Database Records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{totalRecords}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                across {backupInfo?.tables.filter(t => t.count > 0).length || 0} tables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Uploaded Files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileArchive className="h-5 w-5 text-emerald-500" />
                <span className="text-2xl font-bold">{backupInfo?.files.count || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(backupInfo?.files.totalSize || 0)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tables Breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {backupInfo?.tables
                  .filter(t => t.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map(t => (
                    <Badge key={t.name} variant="secondary" className="text-xs">
                      {formatTableName(t.name)}: {t.count}
                    </Badge>
                  ))}
                {backupInfo?.tables.filter(t => t.count > 0).length === 0 && (
                  <span className="text-sm text-muted-foreground">No data</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Create Backup ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Create Backup</CardTitle>
                <CardDescription>
                  Download a complete backup of all data and files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>The backup file includes:</p>
                  <ul className="list-disc list-inside ml-1 space-y-0.5">
                    <li>All database records (machines, categories, leads, settings, etc.)</li>
                    <li>All uploaded images and PDFs</li>
                    <li>Admin user credentials</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownloadBackup}
              disabled={generatingBackup}
              className="w-full cursor-pointer"
              size="lg"
            >
              {generatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup File
                </>
              )}
            </Button>

            {generatingBackup && (
              <p className="text-xs text-center text-muted-foreground">
                This may take a moment depending on the amount of data and files...
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Restore from Backup ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle>Restore from Backup</CardTitle>
                <CardDescription>
                  Upload a backup file to restore all data and files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {restoreProgress.status === 'idle' ? (
              <>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Restoration will:</p>
                      <ul className="list-disc list-inside ml-1 space-y-0.5">
                        <li>Replace ALL current data with the backup data</li>
                        <li>Process large files in chunks to avoid server overload</li>
                        <li>Restore uploaded files to their original locations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatBytes(selectedFile.size)} &middot;{' '}
                        {Math.ceil(selectedFile.size / CHUNK_SIZE)} chunks
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Click to select backup file</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        .zip files only &middot; Large files are processed in chunks
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={handleRestore}
                    disabled={!selectedFile}
                    className="flex-1 cursor-pointer"
                    size="lg"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                  {selectedFile && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      size="lg"
                      className="cursor-pointer"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </>
            ) : (
              /* Active restore progress */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {restoreProgress.status === 'complete' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : restoreProgress.status === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{restoreProgress.currentStep}</p>
                    <p className="text-xs text-muted-foreground">{restoreProgress.message}</p>
                  </div>
                  <Badge variant={
                    restoreProgress.status === 'complete' ? 'default' :
                    restoreProgress.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {restoreProgress.progress}%
                  </Badge>
                </div>

                <Progress value={restoreProgress.progress} className="h-2" />

                {/* Detailed progress */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {(restoreProgress.status === 'uploading' || restoreProgress.status === 'extracting') && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs text-muted-foreground">Upload Progress</p>
                      <p className="font-medium">
                        {restoreProgress.receivedChunks} / {restoreProgress.totalChunks} chunks
                      </p>
                    </div>
                  )}

                  {(restoreProgress.status === 'restoring_db' || restoreProgress.status === 'restoring_files' || restoreProgress.status === 'complete') && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs text-muted-foreground">Database Tables</p>
                      <p className="font-medium">
                        {restoreProgress.restoredTables} / {restoreProgress.totalTables || '?'} tables
                      </p>
                    </div>
                  )}

                  {(restoreProgress.status === 'restoring_files' || restoreProgress.status === 'complete') && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs text-muted-foreground">Files Restored</p>
                      <p className="font-medium">
                        {restoreProgress.restoredFiles} / {restoreProgress.totalFiles || '?'} files
                      </p>
                    </div>
                  )}
                </div>

                {(restoreProgress.status === 'error') && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive font-medium">Error</p>
                    <p className="text-xs text-destructive/80 mt-1">{restoreProgress.error}</p>
                  </div>
                )}

                {(restoreProgress.status === 'error' || restoreProgress.status === 'uploading') && (
                  <Button
                    variant="outline"
                    onClick={cancelRestore}
                    className="w-full cursor-pointer"
                    size="sm"
                  >
                    {restoreProgress.status === 'error' ? 'Dismiss' : 'Cancel Restore'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Danger Zone: Reset App ── */}
      <Card className="border-destructive/30 dark:border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-destructive/5 rounded-lg border border-destructive/10">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">Reset Application</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Delete all data (machines, categories, leads, settings, etc.) and all uploaded files (images, PDFs).
                  Only admin user credentials will be preserved. This action cannot be undone.
                </p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={resetting}
                  className="shrink-0 cursor-pointer"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset App
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Reset Application
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        This will permanently delete <strong>ALL</strong> data and files from the application:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>All machines, categories, and production lines</li>
                        <li>All news posts, projects, and services</li>
                        <li>All partners, FAQs, and leads</li>
                        <li>All site settings</li>
                        <li>All uploaded images, logos, and PDFs</li>
                      </ul>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Preserved: Admin user credentials
                        </p>
                      </div>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        This action is IRREVERSIBLE. Make sure you have a backup first!
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
