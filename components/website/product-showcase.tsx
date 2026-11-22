"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ShowcasePanel {
  id: string;
  label: string;
  /** Server-rendered <ProductCard/> nodes. */
  cards: React.ReactNode[];
}

/**
 * Tabs + horizontally scrolling rail. Cards arrive as server-rendered nodes, so this client
 * component ships only tab state and scroll buttons (no product data, no card code).
 * Card widths: 4-up desktop, 2-up tablet, ~1.4-up phone so the next card peeks in.
 */
export function ProductShowcase({
  heading,
  eyebrow,
  panels,
  viewAllHref = "/shop",
}: {
  heading: string;
  eyebrow?: string;
  panels: ShowcasePanel[];
  viewAllHref?: string;
}) {
  const [activeId, setActiveId] = React.useState(panels[0]?.id);
  const railRefs = React.useRef<Record<string, HTMLUListElement | null>>({});

  function scrollRail(dir: 1 | -1) {
    const rail = activeId ? railRefs.current[activeId] : null;
    if (!rail) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: dir * rail.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="section-header flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-burgundy">{eyebrow}</p>}
          <h2 className="font-serif-display text-4xl leading-[1.1] text-soft-black md:text-5xl">{heading}</h2>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          {panels.length > 1 && (
            <div role="tablist" aria-label="Product groups" className="flex gap-6">
              {panels.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  id={`tab-${p.id}`}
                  aria-selected={p.id === activeId}
                  aria-controls={`panel-${p.id}`}
                  onClick={() => setActiveId(p.id)}
                  className={`focus-ring border-b pb-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    p.id === activeId ? "border-burgundy text-burgundy" : "border-transparent text-taupe hover:text-soft-black"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll products left"
              className="focus-ring flex h-10 w-10 items-center justify-center border border-taupe/40 text-soft-black transition-colors hover:border-burgundy hover:text-burgundy"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Scroll products right"
              className="focus-ring flex h-10 w-10 items-center justify-center border border-taupe/40 text-soft-black transition-colors hover:border-burgundy hover:text-burgundy"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {panels.map((p) => (
        <div key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} hidden={p.id !== activeId}>
          <ul
            ref={(el) => {
              railRefs.current[p.id] = el;
            }}
            className="snap-rail -mx-5 flex scroll-px-5 md:scroll-px-0 gap-4 overflow-x-auto px-5 md:mx-0 md:gap-6 md:px-0 lg:gap-8"
            tabIndex={0}
            aria-label={`${p.label} — scroll horizontally`}
          >
            {p.cards.map((card, i) => (
              <li
                key={i}
                className="w-[72%] shrink-0 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-6rem)/4)]"
              >
                {card}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="mt-14 flex justify-center">
        <Link
          href={viewAllHref}
          className="focus-ring border-b border-burgundy pb-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy transition-colors hover:text-burgundy-light"
        >
          Shop all flowers
        </Link>
      </div>
    </div>
  );
}
