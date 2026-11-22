"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, ImageField, Panel, selectClass, toLocalInput, useActionToast } from "@/components/admin/fields";
import type { FormActionState } from "@/lib/actions/categories";
import type { signaturePicks } from "@/lib/db/schema";

type Pick = typeof signaturePicks.$inferSelect;

export function SignaturePickForm({
  action,
  initial,
  productOptions,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  initial?: Pick;
  productOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { success: false });
  useActionToast(state);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <Panel
        title="Product"
        description="Pick a product to pull its name, price, photos and details automatically. Anything you type below overrides the product's own copy."
      >
        <Checkbox name="enabled" label="Enabled" defaultChecked={initial?.enabled ?? true} />
        <Field label="Product" htmlFor="productId">
          <select id="productId" name="productId" defaultValue={initial?.productId ?? ""} className={selectClass}>
            <option value="">— None (use title & image below) —</option>
            {productOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </Panel>

      <Panel title="Editorial copy">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" htmlFor="eyebrow">
            <Input id="eyebrow" name="eyebrow" defaultValue={initial?.eyebrow ?? "KFLORÉ SIGNATURE"} />
          </Field>
          <Field label="Title override" htmlFor="title" hint="Leave blank to use the product name.">
            <Input id="title" name="title" defaultValue={initial?.title ?? ""} />
          </Field>
        </div>
        <Field label="Description" htmlFor="description" hint="Leave blank to use the product's short description.">
          <Textarea id="description" name="description" rows={3} defaultValue={initial?.description ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Perfect for" htmlFor="occasion">
            <Input id="occasion" name="occasion" defaultValue={initial?.occasion ?? ""} placeholder="Anniversaries, gifting" />
          </Field>
          <Field label="Palette" htmlFor="palette">
            <Input id="palette" name="palette" defaultValue={initial?.palette ?? ""} placeholder="Burgundy, blush, ivory" />
          </Field>
          <Field label="Featured flowers" htmlFor="featuredFlowers">
            <Input id="featuredFlowers" name="featuredFlowers" defaultValue={initial?.featuredFlowers ?? ""} placeholder="Roses, ranunculus" />
          </Field>
        </div>
        <Field label="Button text" htmlFor="ctaText">
          <Input id="ctaText" name="ctaText" defaultValue={initial?.ctaText ?? "DISCOVER THE SIGNATURE"} />
        </Field>
      </Panel>

      <Panel title="Image">
        <ImageField
          name="imageOverride"
          label="Image override (optional)"
          initial={initial?.imageOverride}
          hint="Leave empty to use the product's own photos."
        />
      </Panel>

      <Panel
        title="Schedule"
        description="Create one pick per month with start/end dates and the storefront switches automatically. With no dates, the pick is always eligible; if several qualify, the latest start date wins."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="datetime-local" defaultValue={toLocalInput(initial?.startDate)} />
          </Field>
          <Field label="End" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="datetime-local" defaultValue={toLocalInput(initial?.endDate)} />
          </Field>
        </div>
      </Panel>

      {!state.success && state.message && <p className="text-sm text-burgundy">{state.message}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "SAVING…" : "SAVE"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/signature-picks")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
