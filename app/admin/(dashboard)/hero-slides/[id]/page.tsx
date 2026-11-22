import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { HeroSlideForm } from "@/components/admin/hero-slide-form";
import { updateHeroSlide } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [slide] = await db.select().from(heroSlides).where(eq(heroSlides.id, id));
  if (!slide) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Hero Slide</h1>
      <HeroSlideForm action={updateHeroSlide.bind(null, id)} initial={slide} />
    </div>
  );
}