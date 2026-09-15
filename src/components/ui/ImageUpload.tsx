import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImageWithFallback, type StorageBucket } from '../../services/storage';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: StorageBucket;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  placeholder?: string;
}

export default function ImageUpload({
  value = '',
  onChange,
  bucket = 'event-banners',
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
  maxSizeMB = 10,
  label = 'Image',
  className = '',
  placeholder = 'https://...',
}: ImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const handleProcessFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPG, PNG, WebP, GIF)');
        return;
      }

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Image is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      setIsUploading(true);
      try {
        const finalUrl = await uploadImageWithFallback(bucket, file);
        onChange(finalUrl);
        toast.success('Image loaded successfully');
      } catch (err) {
        console.error('Error handling image upload:', err);
        toast.error('Failed to process image');
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleProcessFile(file);
    },
    [handleProcessFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleProcessFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleProcessFile]
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    onChange(val);
  };

  const handleClear = () => {
    setUrlInput('');
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}

        {/* Tab switch between file upload & direct link */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--glass-border)] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-primary text-white font-medium shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-primary text-white font-medium shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Image Link
          </button>
        </div>
      </div>

      {/* When an image is already set, show preview and actions */}
      {value && value.trim() && !isUploading ? (
        <div className="relative group rounded-xl overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-card)]">
          <img
            src={value.trim()}
            alt="Preview"
            className="w-full h-44 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x400/1e293b/94a3b8?text=Image+Preview+Error';
            }}
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        /* Upload from Documents / Computer Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-[140px] ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-[var(--glass-border)] hover:border-primary/50 hover:bg-[var(--bg-card)]'
          } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-medium text-[var(--text-primary)]">
                Processing & loading image...
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {isDragging ? <ImageIcon className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {isDragging ? 'Drop your image here' : 'Choose image from Documents / Computer'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Click to browse files or drag and drop (JPG, PNG, WebP up to {maxSizeMB}MB)
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* URL Input Tab */
        <div className="space-y-2">
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Paste a public web URL (e.g. Unsplash, Imgur, or Cloud Storage link).
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
