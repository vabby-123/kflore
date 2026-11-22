"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, ImageField, Panel, useActionToast } from "@/components/admin/fields";
import { updateHomepage } from "@/lib/actions/cms";
import type { homepage } from "@/lib/db/schema";

type Homepage = typeof homepage.$inferSelect;

export function HomepageForm({ initial }: { initial: Homepage }) {
  const [state, formAction, pending] = useActionState(updateHomepage, { success: false });
  useActionToast(state);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <p className="text-sm text-taupe">
        The hero carousel is managed under{" "}
        <Link href="/admin/hero-slides" className="text-burgundy underline underline-offset-4">Hero Slides</Link>; section order, the announcement bar and the footer under{" "}
        <Link href="/admin/storefront" className="text-burgundy underline underline-offset-4">Storefront</Link>.
      </p>

      <Panel title="Brand story section">
        <Field label="Heading" htmlFor="aboutHeading">
          <Textarea id="aboutHeading" name="aboutHeading" rows={2} defaultValue={initial.aboutHeading} />
        </Field>
        <Field label="Excerpt" htmlFor="aboutExcerpt">
          <Textarea id="aboutExcerpt" name="aboutExcerpt" rows={3} defaultValue={initial.aboutExcerpt ?? ""} />
        </Field>
        <ImageField name="aboutImage" label="Image" initial={initial.aboutImage} hint="Portrait, at least 1000px wide." />
      </Panel>

      <Panel title="Social & testimonials">
        <Checkbox name="instagramEnabled" label="Show Instagram section" defaultChecked={initial.instagramEnabled} />
        <Field label="Instagram handle" htmlFor="instagramHandle">
          <Input id="instagramHandle" name="instagramHandle" defaultValue={initial.instagramHandle ?? ""} placeholder="@kflore" />
        </Field>
        <Checkbox
          name="testimonialsEnabled"
          label="Show testimonials section (requires testimonial content to be added later)"
          defaultChecked={initial.testimonialsEnabled}
        />
      </Panel>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </Button>
    </form>
  );
}