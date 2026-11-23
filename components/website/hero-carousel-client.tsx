"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlideView {
  id: string;
  label: string;
  media: React.ReactNode;
  content: React.ReactNode;
  /** 0–100 */
  overlay: number;
}

const AUTOPLAY_MS = 6500;

/**
 * Interaction shell for the hero. Slide markup (images, headings, CTAs) is rendered on the
 * server and handed in as nodes, so this component only owns "which slide is active".
 *
 * Performance: only slide 0's image exists in the initial HTML. The next slide's image is mounted
 * once the page is idle / the slide is about to be needed, so we never fetch every hero at once.
 */
export function HeroCarouselClient({ slides }: { slides: HeroSlideView[] }) {
  const count = slides.length;
  const [active, setActive] = React.useState(0);
  const [mounted, setMounted] = React.useState<Set<number>>(() => new Set([0]));
  const [paused, setPaused] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [tabHidden, setTabHidden] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);

  const go = React.useCallback(
    (index: number) => {
      setActive(((index % count) + count) % count);
    },
    [count]
  );

  // Preference + visibility (browser APIs only inside effects → identical SSR/first client render).
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    const onVis = () => setTabHidden(document.hidden);
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Mount the next slide's media ahead of time, but only after the first paint is done.
  React.useEffect(() => {
    if (count < 2) return;
    const next = (active + 1) % count;
    const load = () => setMounted((prev) => (prev.has(active) && prev.has(next) ? prev : new Set([...prev, active, next])));
    if (active === 0 && !mounted.has(next)) {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
      if (w.requestIdleCallback) {
        const id = w.requestIdleCallback(load, { timeout: 3000 });
        return () => w.cancelIdleCallback?.(id);
      }
      const t = setTimeout(load, 1500);
      return () => clearTimeout(t);
    }
    load();
  }, [active, count, mounted]);

  const playing = count > 1 && !paused && !reducedMotion && !tabHidden;
  React.useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => go(active + 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [playing, active, go]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") go(active - 1);
    if (e.key === "ArrowRight") go(active + 1);
  }

  return (
    <section
      className="hero-pull relative h-[min(78svh,760px)] min-h-[600px] w-full overflow-hidden bg-soft-black md:h-[min(86svh,900px)] md:min-h-[600px]"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        touchStart.current = null;
        if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === active;
        return (
          <div
            key={slide.id}
            className="hero-slide absolute inset-0"
            data-active={isActive}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${slide.label}`}
            aria-hidden={!isActive}
            inert={!isActive}
          >
            {mounted.has(i) && slide.media}
            <div className="absolute inset-0 bg-soft-black" style={{ opacity: slide.overlay / 100 }} aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-soft-black/45 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-soft-black/55 to-transparent" aria-hidden="true" />
            <div className="container-kflore relative z-10 flex h-full items-end pb-24 pt-32 md:pb-28 lg:pt-48">{slide.content}</div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <div className="container-kflore pointer-events-none absolute inset-x-0 bottom-8 z-20 flex items-center justify-between md:bottom-10">
            <div className="pointer-events-auto flex items-center gap-2" role="group" aria-label="Choose slide">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${slide.label}`}
                  aria-current={i === active}
                  className="focus-ring group flex h-6 w-9 items-center"
                >
                  <span
                    className={`block h-px w-full transition-colors duration-500 ${i === active ? "bg-ivory" : "bg-ivory/40 group-hover:bg-ivory/70"}`}
                    style={{ height: i === active ? 2 : 1 }}
                  />
                </button>
              ))}
            </div>
            <div className="pointer-events-auto hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(active - 1)}
                aria-label="Previous slide"
                className="focus-ring flex h-11 w-11 items-center justify-center border border-ivory/40 text-ivory transition-colors hover:bg-ivory hover:text-burgundy"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(active + 1)}
                aria-label="Next slide"
                className="focus-ring flex h-11 w-11 items-center justify-center border border-ivory/40 text-ivory transition-colors hover:bg-ivory hover:text-burgundy"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            Slide {active + 1} of {count}
          </p>
        </>
      )}
    </section>
  );
}
