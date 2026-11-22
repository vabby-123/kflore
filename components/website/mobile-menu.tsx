"use client";

import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { buildGeneralEnquiryMessage } from "@/lib/whatsapp";
import { groupCollectionsByType, type NavCollection } from "@/lib/collections";

const MAIN_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/delivery", label: "Delivery" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({
  open,
  onOpenChange,
  collections,
  whatsappNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: NavCollection[];
  whatsappNumber: string;
}) {
  const groups = groupCollectionsByType(collections);
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" title="Navigation menu">
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 pb-6 pt-20">
          <ul className="flex flex-col">
            {MAIN_LINKS.map((l) => (
              <li key={l.href} className="border-b border-taupe/15">
                <Link href={l.href} onClick={close} className="focus-ring block py-4 font-serif-display text-2xl text-soft-black">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {groups.map((g) => (
            <details key={g.type} className="group border-b border-taupe/15">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-taupe [&::-webkit-details-marker]:hidden">
                {g.label}
                <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="pb-3">
                {g.items.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`} onClick={close} className="focus-ring block py-2 text-sm text-soft-black">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
        <div className="border-t border-taupe/15 p-6">
          <WhatsAppButton phoneNumber={whatsappNumber} message={buildGeneralEnquiryMessage()} className="w-full" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
