"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { updateAboutPage } from "@/lib/actions/cms";
import type { aboutPage } from "@/lib/db/schema";

type AboutPage = typeof aboutPage.$inferSelect;

export function AboutForm({ initial }: { initial: AboutPage }) {
  const [state, formAction, pending] = useActionState(updateAboutPage, { success: false });
  const [image, setImage] = useState<UploadedImage[]>(initial.image ? [{ url: initial.image }] : []);

  if (state.success && state.message) toast.success(state.message);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6 border border-taupe/15 bg-white p-6">
      <input type="hidden" name="image" value={image[0]?.url ?? ""} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="familyFlorist" defaultChecked={initial.familyFlorist} className="h-4 w-4 accent-[#5A1725]" />
        We are a family florist
      </label>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="founderName">Founder Name</Label>
        <Input id="founderName" name="founderName" defaultValue={initial.founderName ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="yearsOfExperience">Years of Experience (leave blank if not confirmed)</Label>
        <Input id="yearsOfExperience" name="yearsOfExperience" type="number" min={0} defaultValue={initial.yearsOfExperience ?? ""} />
        <p className="text-xs text-taupe">The public About page will not display a number until this is set.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="story">Brand Story</Label>
        <Textarea id="story" name="story" rows={6} defaultValue={initial.story ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mission">Mission Statement</Label>
        <Textarea id="mission" name="mission" rows={2} defaultValue={initial.mission ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="values">Values (comma-separated)</Label>
        <Input id="values" name="values" defaultValue={initial.values.join(", ")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Image</Label>
        <ImageUploader images={image} onChange={setImage} />
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </Button>
    </form>
  );
}
