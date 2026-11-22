import Link from "next/link";
import type { siteSettings } from "@/lib/db/schema";

type Site = typeof siteSettings.$inferSelect;

export function AnnouncementBar({ site }: { site: Site }) {
  if (!site.announcementEnabled || !site.announcementMessage.trim()) return null;

  const content = (
    <span className="truncate">{site.announcementMessage}</span>
  );

  return (
    <div
      className="text-center text-[11px] font-medium uppercase tracking-[0.18em]"
      style={{ backgroundColor: site.announcementBg, color: site.announcementFg }}
    >
      {site.announcementHref ? (
        <Link href={site.announcementHref} className="focus-ring flex h-9 items-center justify-center px-4 hover:opacity-80">
          {content}
        </Link>
      ) : (
        <p className="flex h-9 items-center justify-center px-4">{content}</p>
      )}
    </div>
  );
}
