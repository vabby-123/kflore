"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, ImageField, Panel, selectClass, toLocalInput, useActionToast } from "@/components/admin/fields";
import { slugify } from "@/lib/utils";
import type { FormActionState } from "@/lib/actions/categories";
import type { journalArticles } from "@/lib/db/schema";

type Article = typeof journalArticles.$inferSelect;

export function ArticleForm({
  action,
  initial,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  initial?: Article;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { success: false });
  useActionToast(state);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <Panel title="Article">
        <Field label="Title" htmlFor="title" error={err("title")}>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" hint="e.g. Seasonal, Care guide, Weddings">
            <Input id="category" name="category" defaultValue={initial?.category ?? ""} />
          </Field>
          <Field label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"} className={selectClass}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
        </div>
        <Field label="Publish date" htmlFor="publishedAt" hint="Optional. Future dates keep the article hidden until then.">
          <Input id="publishedAt" name="publishedAt" type="datetime-local" defaultValue={toLocalInput(initial?.publishedAt)} />
        </Field>
        <Field label="Excerpt" htmlFor="excerpt" hint="Shown on cards and in search results (max 300 characters).">
          <Textarea id="excerpt" name="excerpt" rows={2} maxLength={300} defaultValue={initial?.excerpt ?? ""} />
        </Field>
        <Field label="Body" htmlFor="body" hint="Plain text. Leave a blank line between paragraphs.">
          <Textarea id="body" name="body" rows={14} defaultValue={initial?.body ?? ""} />
        </Field>
        <ImageField name="image" label="Cover image" initial={initial?.image} />
      </Panel>

      {!state.success && state.message && !state.fieldErrors && <p className="text-sm text-burgundy">{state.message}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "SAVING…" : "SAVE"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/journal")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
