"use client";

import * as React from "react";

/**
 * Flips `data-scrolled` on the header using one IntersectionObserver (no scroll listener,
 * no React state, so scrolling never re-renders anything). Purely a progressive enhancement:
 * without JS the header simply stays in its top-of-page state.
 */
export function HeaderScrollState() {
  React.useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-header]");
    const sentinel = document.getElementById("header-sentinel");
    if (!header || !sentinel) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) header.removeAttribute("data-scrolled");
      else header.setAttribute("data-scrolled", "");
    });
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return null;
}
