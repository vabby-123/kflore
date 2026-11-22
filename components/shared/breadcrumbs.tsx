import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-taupe">
      <Link href="/" className="focus-ring hover:text-burgundy">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link href={item.href} className="focus-ring hover:text-burgundy">
              {item.label}
            </Link>
          ) : (
            <span className="text-soft-black">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
