"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateContactSettings } from "@/lib/actions/cms";
import type { contactSettings } from "@/lib/db/schema";

type ContactSettings = typeof contactSettings.$inferSelect;

export function ContactSettingsForm({ initial, showBusinessFields = true }: { initial: ContactSettings; showBusinessFields?: boolean }) {
  const [state, formAction, pending] = useActionState(updateContactSettings, { success: false });
  if (state.success && state.message) toast.success(state.message);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5 border border-taupe/15 bg-white p-6">
      {showBusinessFields && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="businessName">Business Name</Label>
          <Input id="businessName" name="businessName" defaultValue={initial.businessName} />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="whatsapp">WhatsApp Number</Label>
        <Input id="whatsapp" name="whatsapp" defaultValue={initial.whatsapp ?? ""} placeholder="e.g. 601160515983" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" defaultValue={initial.phone ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={initial.email ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" rows={2} defaultValue={initial.address ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="googleMapsUrl">Google Maps URL</Label>
        <Input id="googleMapsUrl" name="googleMapsUrl" defaultValue={initial.googleMapsUrl ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="openingHours">Opening Hours</Label>
        <Textarea id="openingHours" name="openingHours" rows={3} defaultValue={initial.openingHours ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input id="instagram" name="instagram" defaultValue={initial.instagram ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="facebook">Facebook URL</Label>
          <Input id="facebook" name="facebook" defaultValue={initial.facebook ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tiktok">TikTok URL</Label>
          <Input id="tiktok" name="tiktok" defaultValue={initial.tiktok ?? ""} />
        </div>
      </div>
      {showBusinessFields && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={initial.currency} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" name="timezone" defaultValue={initial.timezone} />
          </div>
        </div>
      )}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </Button>
    </form>
  );
}
