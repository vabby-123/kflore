"use client";

import { useActionState, useId } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

const initial: NewsletterState = { success: false, message: "" };

export function NewsletterForm({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initial);
  const id = useId();
  const dark = tone === "dark";

  if (state.success) {
    return (
      <p role="status" className={cn("text-sm", dark ? "text-gold" : "text-burgundy", className)}>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={cn("w-full", className)} noValidate>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={cn("flex border-b", dark ? "border-ivory/40 focus-within:border-gold" : "border-soft-black/40 focus-within:border-burgundy")}>
        <input
          id={id}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          className={cn(
            "h-12 min-w-0 flex-1 bg-transparent text-sm outline-none",
            dark ? "text-ivory placeholder:text-ivory/50" : "text-soft-black placeholder:text-taupe"
          )}
        />
        {/* Honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "focus-ring px-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors disabled:opacity-50",
            dark ? "text-ivory hover:text-gold" : "text-burgundy hover:text-burgundy-light"
          )}
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {state.message && (
        <p role="alert" className={cn("mt-2 text-xs", dark ? "text-rose" : "text-burgundy")}>
          {state.message}
        </p>
      )}
    </form>
  );
}
