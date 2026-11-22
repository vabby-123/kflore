import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { InstagramIcon, FacebookIcon } from "@/components/shared/social-icons";
import { NewsletterForm } from "@/components/website/newsletter-form";
import { buttonVariants } from "@/components/ui/button";
import { buildGeneralEnquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { NavCollection } from "@/lib/collections";
import type { contactSettings, siteSettings } from "@/lib/db/schema";

type Contact = typeof contactSettings.$inferSelect;
type Site = typeof siteSettings.$inferSelect;

const linkClass = "focus-ring block py-1.5 text-sm text-ivory/75 transition-colors hover:text-ivory";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold">{title}</h3>
      {children}
    </div>
  );
}

export function Footer({
  contact,
  site,
  whatsappNumber,
  collections,
}: {
  contact: Contact;
  site: Site;
  whatsappNumber: string;
  collections: NavCollection[];
}) {
  const occasions = collections.filter((c) => c.type === "OCCASION").slice(0, 6);
  const wedding = collections.find((c) => c.slug.includes("wedding"));
  const year = new Date().getFullYear();

  return (
    <footer className="bg-burgundy text-ivory">
      <div className="container-kflore pt-[clamp(5rem,3rem+5vw,8.75rem)] pb-10 md:pb-14">
        {/* Statement */}
        <div className="flex flex-col gap-10 border-b border-ivory/15 pb-16 md:flex-row md:items-end md:justify-between md:pb-20">
          <div className="flex max-w-2xl flex-col gap-6">
            <Logo light className="text-5xl tracking-[0.06em] md:text-7xl" />
            <p className="font-serif-display text-2xl leading-snug text-ivory/85 md:text-3xl">{site.footerStatement}</p>
          </div>
          <a
            href={buildWhatsAppUrl(whatsappNumber, buildGeneralEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "gold", size: "lg", className: "self-start md:self-auto" })}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {site.footerCtaLabel}
          </a>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-4 md:gap-x-10 md:py-20 lg:gap-x-16">
          <Column title="Shop">
            <ul>
              <li><Link href="/shop" className={linkClass}>Shop Flowers</Link></li>
              <li><Link href="/shop" className={linkClass}>Best Sellers</Link></li>
              <li><Link href="/shop?sort=newest" className={linkClass}>New Arrivals</Link></li>
              <li><Link href="/collections" className={linkClass}>Collections</Link></li>
            </ul>
          </Column>
          <Column title="Occasions">
            <ul>
              {occasions.length > 0 ? (
                occasions.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`} className={linkClass}>
                      {c.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li><Link href="/collections" className={linkClass}>All occasions</Link></li>
              )}
            </ul>
          </Column>
          <Column title="Services">
            <ul>
              <li><Link href="/delivery" className={linkClass}>Same-Day Delivery</Link></li>
              <li><Link href="/contact" className={linkClass}>Bespoke Flowers</Link></li>
              <li><Link href={wedding ? `/collections/${wedding.slug}` : "/contact"} className={linkClass}>Wedding Flowers</Link></li>
              <li><Link href="/contact" className={linkClass}>Corporate Flowers</Link></li>
            </ul>
          </Column>
          <Column title="Info">
            <ul>
              <li><Link href="/about" className={linkClass}>About</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
              <li><Link href="/delivery" className={linkClass}>Delivery</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms</Link></li>
            </ul>
          </Column>
        </div>

        {/* Contact + newsletter + social */}
        <div className="grid gap-12 border-t border-ivory/15 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-3 lg:gap-16">
          <Column title="Contact">
            <address className="flex flex-col gap-1.5 text-sm not-italic leading-relaxed text-ivory/80">
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="focus-ring hover:text-ivory">
                  Phone: {contact.phone}
                </a>
              )}
              {(contact.whatsapp || whatsappNumber) && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, buildGeneralEnquiryMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring hover:text-ivory"
                >
                  WhatsApp: {contact.whatsapp || whatsappNumber}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="focus-ring hover:text-ivory">
                  Email: {contact.email}
                </a>
              )}
              <span>Kuala Lumpur &amp; Selangor</span>
              {contact.address && <span className="whitespace-pre-line">{contact.address}</span>}
              {contact.openingHours && <span className="mt-3 whitespace-pre-line text-ivory/65">{contact.openingHours}</span>}
            </address>
          </Column>

          <div className="lg:col-span-1">
            <Column title={site.newsletterHeading}>
              <p className="mb-4 max-w-sm text-sm leading-relaxed text-ivory/70">{site.newsletterText}</p>
              <NewsletterForm tone="dark" className="max-w-sm" />
            </Column>
          </div>

          <Column title="Follow">
            <ul className="flex flex-col">
              {contact.instagram && (
                <li>
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-2.5`}>
                    <InstagramIcon className="h-4 w-4" /> Instagram
                  </a>
                </li>
              )}
              {contact.facebook && (
                <li>
                  <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className={`${linkClass} flex items-center gap-2.5`}>
                    <FacebookIcon className="h-4 w-4" /> Facebook
                  </a>
                </li>
              )}
              {contact.tiktok && (
                <li>
                  <a href={contact.tiktok} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    TikTok
                  </a>
                </li>
              )}
              {!contact.instagram && !contact.facebook && !contact.tiktok && (
                <li className="text-sm text-ivory/50">Social links can be added in the admin panel.</li>
              )}
            </ul>
          </Column>
        </div>

        <div className="flex flex-col gap-3 border-t border-ivory/15 pt-8 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} KFLORÉ. All rights reserved.
          </p>
          <p className="flex gap-6">
            <Link href="/privacy" className="focus-ring hover:text-ivory">Privacy</Link>
            <Link href="/terms" className="focus-ring hover:text-ivory">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
