"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { formatPriceMYR } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string | null;
  category: string | null;
}

export function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // Reset transient search state when the sheet closes so it opens fresh next time.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) {
      setQuery("");
      setResults([]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- debounced search reacting to query changes */
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" title="Search KFLORÉ" className="max-w-none">
        <div className="container-kflore flex flex-col gap-6 pt-20 pb-10">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search flowers, occasions, collections…"
              className="h-14 pl-12 text-base"
              onKeyDown={(e) => {
                if (e.key === "Escape") onOpenChange(false);
              }}
            />
          </div>

          {loading && <p className="text-xs text-taupe">Searching…</p>}

          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/product/${r.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="focus-ring group flex flex-col gap-2"
                >
                  <div className="relative aspect-square overflow-hidden bg-white">
                    {r.image && (
                      <Image src={r.image} alt={r.name} fill sizes="200px" className="object-cover" />
                    )}
                  </div>
                  <span className="text-sm text-soft-black group-hover:text-burgundy">{r.name}</span>
                  <span className="text-xs text-taupe">{formatPriceMYR(r.price)}</span>
                </Link>
              ))}
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-taupe">No flowers found for &ldquo;{query}&rdquo;.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
