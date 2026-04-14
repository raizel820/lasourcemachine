'use client';

import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  folder?: string;
  accept?: string;
  className?: string;
  previewClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
  folder = 'general',
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
  className = '',
  previewClassName = 'h-24 w-full',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      {/* Mode Toggle */}
      <div className="flex items-center gap-1 p-0.5 bg-muted rounded-md w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
            mode === 'upload'
              ? 'bg-background shadow-sm font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
            mode === 'url'
              ? 'bg-background shadow-sm font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          From URL
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative group">
          <div className={`relative overflow-hidden rounded-md border bg-muted/30 ${previewClassName}`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${label.replace(/\s/g, '-')}`}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full h-24 border-dashed cursor-pointer"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-xs">
                  {value ? 'Replace image' : 'Click to upload'}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  JPG, PNG, WebP, GIF, SVG (max 10MB)
                </span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <Input
            value={value.startsWith('/uploads/') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {value && value.startsWith('/uploads/') && (
            <p className="text-xs text-muted-foreground">
              Currently using uploaded file: {value}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
