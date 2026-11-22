"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, GripVertical } from "lucide-react";
import { toast } from "sonner";

export interface UploadedImage {
  url: string;
  altText?: string;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export function ImageUploader({
  images,
  onChange,
  max,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  /** Hide the upload tile once this many images are present (e.g. 1 for single-image fields). */
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const full = max !== undefined && images.length >= max;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      const room = max === undefined ? files.length : Math.max(0, max - images.length);
      for (const file of Array.from(files).slice(0, room)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Upload failed");
        }
        const data = await res.json();
        uploaded.push({ url: data.url });
      }
      onChange([...images, ...uploaded]);
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(index: number) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndex.current = null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.url + i}
            draggable={max !== 1}
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className="group relative aspect-square overflow-hidden border border-taupe/30 bg-white"
          >
            <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="focus-ring absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-soft-black/70 text-white opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {max !== 1 && (
              <span className="absolute bottom-1 left-1 flex h-6 w-6 cursor-grab items-center justify-center bg-soft-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3.5 w-3.5" />
              </span>
            )}
            {i === 0 && max !== 1 && (
              <span className="absolute left-1 top-1 bg-gold px-1.5 py-0.5 text-[9px] uppercase tracking-label text-soft-black">
                Primary
              </span>
            )}
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="focus-ring flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-taupe/40 text-taupe hover:border-burgundy hover:text-burgundy"
          >
            <Upload className="h-5 w-5" />
            <span className="text-[10px] uppercase tracking-label">{uploading ? "Uploading…" : "Upload"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={max !== 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-taupe">
        JPG, PNG, WebP or AVIF, up to 8 MB. Large photos are resized automatically; upload the sharpest original you have.
        {max !== 1 && " Drag to reorder. The first image is the primary photo."}
      </p>
    </div>
  );
}
