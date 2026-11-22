import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-6 text-center">
      <Logo />
      <span className="font-serif-display text-6xl text-burgundy">404</span>
      <h1 className="font-serif-display text-2xl text-soft-black">This page has wilted away.</h1>
      <p className="max-w-sm text-sm text-taupe">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/">RETURN HOME</Link>
      </Button>
    </div>
  );
}
