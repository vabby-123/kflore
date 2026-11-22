"use client";

import * as React from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { cn } from "@/lib/utils";
import type { FormActionState } from "@/lib/actions/categories";

/** Fire a toast when a server action reports a new result (kept out of render, so no double toasts). */
export function useActionToast(state: FormActionState) {
  const last = React.useRef<FormActionState | null>(null);
  React.useEffect(() => {
    if (state === last.current) return;
    last.current = state;
    if (state.success && state.message) toast.success(state.message);
    else if (!state.success && state.message) toast.error(state.message);
  }, [state]);
}

export function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border border-taupe/15 bg-white p-6">
      <div>
        <h2 className="font-serif-display text-lg text-soft-black">{title}</h2>
        {description && <p className="mt-1 text-xs text-taupe">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-taupe">{hint}</p>}
      {error && <p className="text-xs text-burgundy">{error}</p>}
    </div>
  );
}

export const selectClass = "focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm";

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#5A1725]" />
      {label}
    </label>
  );
}

/** Single-image field: uploader + hidden input carrying the URL in the form post. */
export function ImageField({
  name,
  label,
  initial,
  hint,
  onChange,
}: {
  name: string;
  label: string;
  initial?: string | null;
  hint?: string;
  onChange?: (url: string) => void;
}) {
  const [images, setImages] = React.useState<UploadedImage[]>(initial ? [{ url: initial }] : []);
  return (
    <Field label={label} hint={hint}>
      <input type="hidden" name={name} value={images[0]?.url ?? ""} />
      <ImageUploader
        max={1}
        images={images}
        onChange={(next) => {
          setImages(next);
          onChange?.(next[0]?.url ?? "");
        }}
      />
    </Field>
  );
}

/** Convert a Date to the `YYYY-MM-DDTHH:mm` string a datetime-local input expects. */
export function toLocalInput(d: Date | null | undefined) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
