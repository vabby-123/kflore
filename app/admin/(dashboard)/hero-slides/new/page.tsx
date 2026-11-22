import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { createHeroSlide } from "@/lib/actions/storefront";

export default function NewHeroSlidePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Hero Slide</h1>
      <HeroSlideForm action={createHeroSlide} />
    </div>
  );
}