import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null, previewUrl: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 5,
  label = 'Upload Image',
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || '');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError('');

      // Validate type
      const validTypes = accept.split(',').map(t => t.trim());
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Allowed: JPG, PNG, WebP, GIF');
        return;
      }

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large. Maximum ${maxSizeMB}MB.`);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file, url);
    },
    [accept, maxSizeMB, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearImage = useCallback(() => {
    setPreview('');
    setError('');
    onChange(null, '');
    if (inputRef.current) inputRef.current.value = '';
  }, [onChange]);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border border-[var(--glass-border)]"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-[var(--glass-border)] hover:border-primary/50 hover:bg-[var(--bg-card)]'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {isDragging ? (
              <ImageIcon className="w-6 h-6 text-primary" />
            ) : (
              <Upload className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {isDragging ? 'Drop image here' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              JPG, PNG, WebP, GIF • Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
