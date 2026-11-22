"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, ImageField, Panel, selectClass, useActionToast } from "@/components/admin/fields";
import type { FormActionState } from "@/lib/actions/categories";
import type { heroSlides } from "@/lib/db/schema";

type Slide = typeof heroSlides.$inferSelect;

const TEXT_ALIGN = { left: "items-start text-left", center: "items-center text-center", right: "items-end text-right" } as const;

export function HeroSlideForm({
  action,
  initial,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  initial?: Slide;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { success: false });
  useActionToast(state);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  // Live preview state
  const [title, setTitle] = useState(initial?.title ?? "");
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [overlay, setOverlay] = useState(initial?.overlayOpacity ?? 35);
  const [position, setPosition] = useState<keyof typeof TEXT_ALIGN>((initial?.textPosition as keyof typeof TEXT_ALIGN) ?? "left");
  const [objectPosition, setObjectPosition] = useState(initial?.objectPosition ?? "center");

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <Panel title="Preview" description="Approximate desktop crop. The real hero fills the full browser width.">
        <div className="relative aspect-[16/8] overflow-hidden bg-soft-black">
          {image && <Image src={image} alt="" fill sizes="768px" className="object-cover" style={{ objectPosition }} />}
          <div className="absolute inset-0 bg-soft-black" style={{ opacity: overlay / 100 }} />
          <div className={`absolute inset-0 flex flex-col justify-end gap-2 p-6 ${TEXT_ALIGN[position]}`}>
            {eyebrow && <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
            <p className="font-serif-display max-w-md text-3xl leading-tight text-ivory">{title || "Slide title"}</p>
            {subtitle && <p className="max-w-xs text-xs text-ivory/85">{subtitle}</p>}
          </div>
        </div>
      </Panel>

      <Panel title="Content">
        <Field label="Eyebrow" htmlFor="eyebrow" hint="Small line above the title, e.g. KFLORÉ / SEASONAL COLLECTION">
          <Input id="eyebrow" name="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </Field>
        <Field label="Title" htmlFor="title" error={err("title")}>
          <Input id="title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Supporting text" htmlFor="subtitle">
          <Textarea id="subtitle" name="subtitle" rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary button label" htmlFor="primaryCtaLabel">
            <Input id="primaryCtaLabel" name="primaryCtaLabel" defaultValue={initial?.primaryCtaLabel ?? ""} />
          </Field>
          <Field label="Primary button link" htmlFor="primaryCtaHref" error={err("primaryCtaHref")}>
            <Input id="primaryCtaHref" name="primaryCtaHref" defaultValue={initial?.primaryCtaHref ?? ""} placeholder="/shop" />
          </Field>
          <Field label="Secondary button label" htmlFor="secondaryCtaLabel">
            <Input id="secondaryCtaLabel" name="secondaryCtaLabel" defaultValue={initial?.secondaryCtaLabel ?? ""} />
          </Field>
          <Field label="Secondary button link" htmlFor="secondaryCtaHref" error={err("secondaryCtaHref")}>
            <Input id="secondaryCtaHref" name="secondaryCtaHref" defaultValue={initial?.secondaryCtaHref ?? ""} placeholder="/collections" />
          </Field>
        </div>
      </Panel>

      <Panel title="Images" description="Use landscape photography at least 2000px wide. A separate portrait crop keeps phones from downloading the desktop image.">
        <ImageField name="image" label="Desktop image" initial={initial?.image} onChange={setImage} />
        {err("image") && <p className="-mt-3 text-xs text-burgundy">{err("image")}</p>}
        <ImageField name="mobileImage" label="Mobile image (optional)" initial={initial?.mobileImage} hint="Portrait, ideally 1080×1440." />
      </Panel>

      <Panel title="Layout">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Text position" htmlFor="textPosition">
            <select
              id="textPosition"
              name="textPosition"
              value={position}
              onChange={(e) => setPosition(e.target.value as keyof typeof TEXT_ALIGN)}
              className={selectClass}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
          <Field label="Image focus" htmlFor="objectPosition" hint="center, top, bottom, or e.g. 50% 30%" error={err("objectPosition")}>
            <Input id="objectPosition" name="objectPosition" value={objectPosition} onChange={(e) => setObjectPosition(e.target.value)} />
          </Field>
          <Field label={`Overlay darkness (${overlay}%)`} htmlFor="overlayOpacity">
            <input
              id="overlayOpacity"
              name="overlayOpacity"
              type="range"
              min={0}
              max={80}
              value={overlay}
              onChange={(e) => setOverlay(Number(e.target.value))}
              className="h-11 accent-[#5A1725]"
            />
          </Field>
          <Field label="Sort order" htmlFor="sortOrder">
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
          </Field>
        </div>
        <Checkbox name="active" label="Active (shown on the homepage; the first 5 active slides are used)" defaultChecked={initial?.active ?? true} />
      </Panel>

      {!state.success && state.message && !state.fieldErrors && <p className="text-sm text-burgundy">{state.message}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "SAVING…" : "SAVE SLIDE"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/hero-slides")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
