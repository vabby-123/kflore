"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, ImageField, Panel, useActionToast } from "@/components/admin/fields";
import { updateSiteSettings } from "@/lib/actions/storefront";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/homepage-sections";
import type { siteSettings } from "@/lib/db/schema";

type Site = typeof siteSettings.$inferSelect;

export function StorefrontForm({
  initial,
  sections,
}: {
  initial: Site;
  sections: Record<string, { enabled: boolean; sortOrder: number }>;
}) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, { success: false });
  useActionToast(state);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <Panel title="Announcement bar" description="The slim bar above the header. Keep it to one short line.">
        <Checkbox name="announcementEnabled" label="Show the announcement bar" defaultChecked={initial.announcementEnabled} />
        <Field label="Message" htmlFor="announcementMessage" error={err("announcementMessage")}>
          <Input id="announcementMessage" name="announcementMessage" defaultValue={initial.announcementMessage} maxLength={160} />
        </Field>
        <Field label="Link (optional)" htmlFor="announcementHref" hint="e.g. /delivery or https://…" error={err("announcementHref")}>
          <Input id="announcementHref" name="announcementHref" defaultValue={initial.announcementHref ?? ""} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Background colour" htmlFor="announcementBg" error={err("announcementBg")}>
            <Input id="announcementBg" name="announcementBg" defaultValue={initial.announcementBg} placeholder="#5A1725" />
          </Field>
          <Field label="Text colour" htmlFor="announcementFg" error={err("announcementFg")}>
            <Input id="announcementFg" name="announcementFg" defaultValue={initial.announcementFg} placeholder="#F5F0E8" />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Homepage sections"
        description="Show or hide each section and set its order (lower numbers appear first). The hero and benefits strip always come first; edit slides under Hero Slides."
      >
        <div className="flex flex-col divide-y divide-taupe/15">
          {DEFAULT_HOMEPAGE_SECTIONS.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 py-3">
              <Checkbox name={`section_${s.key}_enabled`} label={s.label} defaultChecked={sections[s.key]?.enabled ?? true} />
              <Input
                name={`section_${s.key}_order`}
                type="number"
                aria-label={`${s.label} order`}
                defaultValue={sections[s.key]?.sortOrder ?? s.sortOrder}
                className="w-24"
              />
            </div>
          ))}
        </div>
        <Field label="Featured products heading" htmlFor="featuredHeading" error={err("featuredHeading")}>
          <Input id="featuredHeading" name="featuredHeading" defaultValue={initial.featuredHeading} />
        </Field>
      </Panel>

      <Panel title="Newsletter" description="Used in the homepage newsletter section and in the footer.">
        <Field label="Heading" htmlFor="newsletterHeading" error={err("newsletterHeading")}>
          <Input id="newsletterHeading" name="newsletterHeading" defaultValue={initial.newsletterHeading} />
        </Field>
        <Field label="Text" htmlFor="newsletterText" error={err("newsletterText")}>
          <Textarea id="newsletterText" name="newsletterText" rows={2} defaultValue={initial.newsletterText} />
        </Field>
      </Panel>

      <Panel title="Footer" description="Contact details, opening hours and social links are edited under Contact.">
        <Field label="Statement" htmlFor="footerStatement" error={err("footerStatement")}>
          <Textarea id="footerStatement" name="footerStatement" rows={2} defaultValue={initial.footerStatement} />
        </Field>
        <Field label="WhatsApp button label" htmlFor="footerCtaLabel" error={err("footerCtaLabel")}>
          <Input id="footerCtaLabel" name="footerCtaLabel" defaultValue={initial.footerCtaLabel} />
        </Field>
      </Panel>

      <Panel
        title="Payment methods"
        description="Checkout always offers WhatsApp ordering. Upload a QR code or fill in bank details to also offer that method at checkout — leave blank and checkout will tell the customer we'll WhatsApp them the details after they place the order. These are manual methods: the customer pays on their own device, then you confirm the payment arrived from Admin → Payments."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <ImageField name="paymentTngQrImage" label="Touch 'n Go eWallet QR" initial={initial.paymentTngQrImage} hint="Export your static TNG QR code as an image." />
          <ImageField name="paymentDuitnowQrImage" label="DuitNow QR" initial={initial.paymentDuitnowQrImage} />
          <ImageField name="paymentMaybankQrImage" label="Maybank QRPay" initial={initial.paymentMaybankQrImage} />
        </div>
        <Field label="Bank transfer details" htmlFor="paymentBankDetails" hint="Shown as-is at checkout, e.g. bank name, account number, account holder name." error={err("paymentBankDetails")}>
          <Textarea
            id="paymentBankDetails"
            name="paymentBankDetails"
            rows={3}
            maxLength={600}
            defaultValue={initial.paymentBankDetails ?? ""}
            placeholder={"Maybank\n1234 5678 9012\nKFLORÉ Sdn Bhd"}
          />
        </Field>
      </Panel>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </Button>
    </form>
  );
}
