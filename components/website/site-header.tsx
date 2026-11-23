import { Logo } from "@/components/shared/logo";
import { DesktopNav } from "@/components/website/desktop-nav";
import { HeaderActions } from "@/components/website/header-actions";
import { HeaderScrollState } from "@/components/website/header-scroll";
import type { NavCollection } from "@/lib/collections";

/**
 * Server-rendered sticky header. Only the action icons (search, cart, menu) are client code;
 * the transparent-over-hero → solid transition is CSS driven (see globals.css).
 */
export function SiteHeader({
  whatsappNumber,
  collections,
  paymentsEnabled,
}: {
  whatsappNumber: string;
  collections: NavCollection[];
  paymentsEnabled: boolean;
}) {
  return (
    <header data-header className="sticky top-0 z-40">
      <HeaderScrollState />
      <div className="container-kflore relative grid h-[var(--header-h)] grid-cols-[1fr_auto] items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* Centered on mobile (the icon row flanks it); falls back into normal grid flow at desktop. */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:left-auto lg:top-auto lg:col-start-2 lg:row-start-1 lg:translate-x-0 lg:translate-y-0 lg:justify-self-center">
          <Logo inherit />
        </div>
        <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
          <DesktopNav collections={collections} />
        </div>
        <div className="contents">
          <HeaderActions whatsappNumber={whatsappNumber} collections={collections} paymentsEnabled={paymentsEnabled} />
        </div>
      </div>
    </header>
  );
}
