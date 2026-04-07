'use client';

import { useState, useRef } from 'react';
import { Upload, X, Plus, GripVertical, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageGalleryUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  folder?: string;
  maxImages?: number;
  className?: string;
}

export function ImageGalleryUpload({
  images,
  onChange,
  label = 'Images',
  folder = 'general',
  maxImages = 20,
  className = '',
}: ImageGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 10MB limit`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          const data = await res.json();
          alert(`Failed to upload "${file.name}": ${data.error}`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }
    onChange([...images, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    handleReorder(index, newIndex);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <span className="text-xs text-muted-foreground">
            {images.length}/{maxImages} images
          </span>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square rounded-md border overflow-hidden bg-muted/30"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<div class="w-full h-full flex items-center justify-center text-muted-foreground"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                }}
              />

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveImage(index, 'left')}
                  >
                    <span className="text-xs">&larr;</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveImage(index, 'right')}
                  >
                    <span className="text-xs">&rarr;</span>
                  </Button>
                )}
              </div>

              {/* Image Number Badge */}
              <div className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Controls */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="gallery-upload-input"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 cursor-pointer"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              From URL
            </Button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddUrl}
                className="cursor-pointer"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag images here
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            JPG, PNG, WebP, GIF, SVG (max 10MB each)
          </p>
        </div>
      )}
    </div>
  );
}
