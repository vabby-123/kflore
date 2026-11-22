"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-6 text-center">
      <Logo />
      <h1 className="font-serif-display text-2xl text-soft-black">Something went wrong.</h1>
      <p className="max-w-sm text-sm text-taupe">
        We&rsquo;re sorry for the inconvenience. Please try again, or reach us on WhatsApp if the issue continues.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>TRY AGAIN</Button>
        <Button variant="secondary" asChild>
          <Link href="/">RETURN HOME</Link>
        </Button>
      </div>
    </div>
  );
}
