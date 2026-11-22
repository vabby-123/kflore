"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, ImageField, Panel, selectClass, useActionToast } from "@/components/admin/fields";
import { COLLECTION_TYPES } from "@/lib/collections";
import { slugify } from "@/lib/utils";
import type { FormActionState } from "@/lib/actions/categories";

interface TaxonomyInitial {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  status: string;
  // Collection-only fields
  heroImage?: string | null;
  tagline?: string | null;
  type?: string;
  featured?: boolean;
  homepagePosition?: number | null;
}

/** Shared by categories (basic fields) and collections (`withCollectionFields`: type, tagline, homepage placement). */
export function TaxonomyForm({
  action,
  backHref,
  initial,
  withCollectionFields = false,
  customTypes = [],
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  backHref: string;
  initial?: TaxonomyInitial;
  withCollectionFields?: boolean;
  /** Custom collection types already in use, offered as suggestions. */
  customTypes?: string[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { success: false });
  useActionToast(state);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  const typeSuggestions = [...COLLECTION_TYPES.map((t) => t.value as string), ...customTypes.filter((t) => !COLLECTION_TYPES.some((b) => b.value === t))];

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <Panel title="Details">
        <Field label="Name" htmlFor="name" error={err("name")}>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")}>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
          />
        </Field>
        {withCollectionFields && (
          <Field label="Short descriptor" htmlFor="tagline" hint='Shown on collection tiles, e.g. "Celebrate your story."' error={err("tagline")}>
            <Input id="tagline" name="tagline" maxLength={120} defaultValue={initial?.tagline ?? ""} />
          </Field>
        )}
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={3} defaultValue={initial?.description ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sort order" htmlFor="sortOrder">
            <Input id="sortOrder" name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={initial?.status ?? "PUBLISHED"} className={selectClass}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Unpublished</option>
            </select>
          </Field>
        </div>
      </Panel>

      {withCollectionFields && (
        <Panel title="Grouping & homepage" description="Type decides which menu group the collection appears in. Featured collections appear in the homepage lookbook.">
          <Field label="Collection type" htmlFor="type" hint="Pick a built-in type or type your own (e.g. SEASON) to create a new group." error={err("type")}>
            <Input id="type" name="type" list="collection-types" required defaultValue={initial?.type ?? "OCCASION"} />
            <datalist id="collection-types">
              {typeSuggestions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <Checkbox name="featured" label="Feature on the homepage" defaultChecked={initial?.featured} />
          <Field label="Homepage position" htmlFor="homepagePosition" hint="1 is the large tile at top-left. Only the first six featured collections are shown.">
            <Input id="homepagePosition" name="homepagePosition" type="number" min={1} defaultValue={initial?.homepagePosition ?? ""} className="max-w-32" />
          </Field>
        </Panel>
      )}

      <Panel title="Images">
        <ImageField name="image" label={withCollectionFields ? "Thumbnail / tile image" : "Image"} initial={initial?.image} hint="Portrait or landscape at least 1200px wide." />
        {withCollectionFields && (
          <ImageField name="heroImage" label="Hero image (optional)" initial={initial?.heroImage} />
        )}
      </Panel>

      {!state.success && state.message && !state.fieldErrors && <p className="text-sm text-burgundy">{state.message}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "SAVING…" : "SAVE"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(backHref)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
