import Link from "next/link";
import { groupCollectionsByType, type NavCollection } from "@/lib/collections";

const linkClass =
  "focus-ring nav-link inline-block py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--hdr-fg)] transition-colors hover:text-[color:var(--hdr-accent)]";

const panelLink = "focus-ring block py-1.5 text-sm text-soft-black/80 transition-colors hover:text-burgundy";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mega-panel absolute inset-x-0 top-full border-y border-taupe/20 bg-ivory text-soft-black shadow-[0_24px_40px_-24px_rgba(21,19,19,0.25)]">
      <div className="container-kflore py-10 lg:py-12">{children}</div>
    </div>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">{children}</p>;
}

function CollectionList({ items }: { items: NavCollection[] }) {
  return (
    <ul>
      {items.map((c) => (
        <li key={c.slug}>
          <Link href={`/collections/${c.slug}`} className={panelLink}>
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const SHOP_TYPES = ["TYPE", "OCCASION", "STYLE"];

/**
 * Desktop navigation. Server component: the mega menus open on CSS hover / focus-within,
 * so they need no client JS and no hydration. Hidden below `lg` (mobile uses the slide-in menu).
 */
export function DesktopNav({ collections }: { collections: NavCollection[] }) {
  const groups = groupCollectionsByType(collections);
  const shopGroups = groups.filter((g) => SHOP_TYPES.includes(g.type));
  const otherGroups = groups.filter((g) => !SHOP_TYPES.includes(g.type));
  const occasions = groups.find((g) => g.type === "OCCASION")?.items ?? [];
  const wedding = collections.find((c) => c.slug.includes("wedding"));

  return (
    <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
      <div className="nav-item">
        <Link href="/shop" className={linkClass}>
          Shop
        </Link>
        <Panel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-x-12 gap-y-8">
            {shopGroups.map((g) => (
              <div key={g.type}>
                <ColumnTitle>{g.label}</ColumnTitle>
                <CollectionList items={g.items} />
              </div>
            ))}
            <div>
              <ColumnTitle>Discover</ColumnTitle>
              <ul>
                <li><Link href="/shop" className={panelLink}>Shop all flowers</Link></li>
                <li><Link href="/shop?sort=newest" className={panelLink}>New arrivals</Link></li>
                <li><Link href="/collections" className={panelLink}>All collections</Link></li>
              </ul>
            </div>
          </div>
        </Panel>
      </div>

      <div className="nav-item">
        <Link href="/collections" className={linkClass}>
          Collections
        </Link>
        <Panel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-x-12 gap-y-8">
            {(otherGroups.length ? otherGroups : groups).map((g) => (
              <div key={g.type}>
                <ColumnTitle>{g.label}</ColumnTitle>
                <CollectionList items={g.items} />
              </div>
            ))}
            <div>
              <ColumnTitle>Explore</ColumnTitle>
              <Link href="/collections" className={panelLink}>View all collections</Link>
            </div>
          </div>
        </Panel>
      </div>

      {occasions.length > 0 && (
        <div className="nav-item">
          <Link href="/collections" className={linkClass}>
            Occasions
          </Link>
          <Panel>
            <ColumnTitle>Shop by occasion</ColumnTitle>
            <ul className="grid max-w-3xl grid-cols-3 gap-x-12">
              {occasions.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/${c.slug}`} className={panelLink}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      <div className="nav-item">
        <Link href={wedding ? `/collections/${wedding.slug}` : "/collections"} className={linkClass}>
          Weddings
        </Link>
      </div>

      <div className="nav-item">
        <Link href="/about" className={linkClass}>
          About
        </Link>
      </div>
    </nav>
  );
}
