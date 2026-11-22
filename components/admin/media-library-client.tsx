"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Copy, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia } from "@/lib/actions/media";

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  filename: string;
  altText: string | null;
  createdAt: Date;
}

export function MediaLibraryClient({ items }: { items: MediaItem[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const [localItems, setLocalItems] = useState(items);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Upload failed");
        const data = await res.json();
        setLocalItems((prev) => [{ id: data.id, url: data.url, thumbnailUrl: data.thumbnailUrl, width: data.width, height: data.height, filename: file.name, altText: null, createdAt: new Date() }, ...prev]);
      }
      toast.success("Upload complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const filtered = localItems.filter((i) => i.filename.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search media…"
            className="focus-ring h-10 w-full border border-taupe/40 bg-white pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="focus-ring flex items-center gap-2 bg-burgundy px-5 py-2.5 text-xs uppercase tracking-label text-ivory hover:bg-burgundy-light"
        >
          <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload Image"}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center border border-dashed border-taupe/30 bg-white/60 p-16 text-sm text-taupe">
          No media yet — upload your first image.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((item) => (
            <div key={item.id} className="group relative flex flex-col gap-2 border border-taupe/15 bg-white p-2">
              <div className="relative aspect-square overflow-hidden bg-ivory">
                <Image src={item.thumbnailUrl || item.url} alt={item.altText || item.filename} fill sizes="200px" className="object-cover" />
              </div>
              <span className="truncate text-xs text-taupe">{item.filename}</span>
              {item.width && item.height && <span className="text-[10px] text-taupe/70">{item.width}×{item.height}px</span>}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success("URL copied");
                  }}
                  className="focus-ring text-taupe hover:text-burgundy"
                  aria-label="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(async () => {
                      await deleteMedia(item.id);
                      setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
                      toast.success("Deleted");
                    });
                  }}
                  className="focus-ring text-taupe hover:text-burgundy"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
