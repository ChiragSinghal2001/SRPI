import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, RefreshCw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ObjectType, CapturedImageItem } from '../../types/inspection';
import { compressImage } from '../../utils/imageCompressor';
import { cn } from '../../utils/cn';

interface ImageUploadTileProps {
  roomName: string;
  objectType: ObjectType;
  label?: string;
  capturedItem?: CapturedImageItem;
  uploadProgress?: number;
  onImageCaptured: (item: CapturedImageItem) => void;
  onImageRemoved: () => void;
  required?: boolean;
}

export const ImageUploadTile: React.FC<ImageUploadTileProps> = ({
  roomName,
  objectType,
  label,
  capturedItem,
  uploadProgress,
  onImageCaptured,
  onImageRemoved,
  required = true,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayTitle = label || objectType.charAt(0).toUpperCase() + objectType.slice(1);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      // Perform client-side compression before staging/upload
      const compressed = await compressImage(file, 1920, 1080, 0.82);
      setCompressionRatio(compressed.compressionRatio);

      const captured: CapturedImageItem = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roomName,
        objectType,
        dataUrl: compressed.dataUrl,
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        timestamp: new Date().toISOString(),
        uploadProgress: 100,
      };

      onImageCaptured(captured);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compress/upload image';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
      // Reset input value so same file can be re-selected if retaking
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border-2 transition-all p-3 bg-white dark:bg-slate-900',
        capturedItem
          ? 'border-emerald-300 dark:border-emerald-800 shadow-xs'
          : required
          ? 'border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
          : 'border-slate-200 dark:border-slate-800'
      )}
    >
      {/* Hidden file input supporting mobile camera capture via capture="environment" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
        aria-label={`Upload photo for ${displayTitle} in ${roomName}`}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {displayTitle}
          </span>
          {required && (
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              *Req
            </span>
          )}
        </div>

        {capturedItem ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} /> Captured
          </span>
        ) : (
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            Needs Photo
          </span>
        )}
      </div>

      {/* Preview or Action Shutter area */}
      {capturedItem ? (
        <div className="relative group w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
          <img
            src={capturedItem.dataUrl}
            alt={`${roomName} ${displayTitle}`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={triggerPicker}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 font-medium text-xs shadow-md hover:bg-slate-100 active:scale-95 transition-transform"
            >
              <RefreshCw size={13} /> Retake
            </button>
            <button
              type="button"
              onClick={onImageRemoved}
              aria-label="Remove photo"
              className="p-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-transform"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {/* Compressed stats badge */}
          {compressionRatio !== null && (
            <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-[10px] text-white px-1.5 py-0.5 rounded">
              Saved {compressionRatio}%
            </div>
          )}
        </div>
      ) : (
        /* Empty / Capture Trigger */
        <button
          type="button"
          onClick={triggerPicker}
          disabled={isProcessing}
          className={cn(
            'w-full aspect-[4/3] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 flex flex-col items-center justify-center gap-2 p-4 text-center cursor-pointer transition-colors active:scale-[0.98]',
            isProcessing && 'opacity-60 cursor-wait'
          )}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="text-blue-600 animate-spin" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Optimizing image...
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <Camera size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Tap to Take Photo
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1 mt-0.5">
                  <UploadCloud size={12} /> or choose from files
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {/* Upload Progress Bar if active */}
      {uploadProgress !== undefined && uploadProgress < 100 && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTile;
