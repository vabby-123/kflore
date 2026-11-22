import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAboutContent } from "@/lib/db/queries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "About KFLORÉ",
  description: "The story behind KFLORÉ — a family florist crafting timeless floral expressions.",
  path: "/about",
});

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="flex flex-col">
      <section className="container-kflore section grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={about.image || "/images/placeholders/about-story.svg"}
            alt="KFLORÉ floral craftsmanship"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow="ABOUT KFLORÉ" title="Where flowers become timeless expressions." align="left" />
          {about.familyFlorist && (
            <p className="text-sm leading-relaxed text-taupe md:text-base">
              KFLORÉ is a family-run florist, built on a shared passion for creating beautiful floral arrangements.
            </p>
          )}
          {about.yearsOfExperience ? (
            <p className="text-sm leading-relaxed text-taupe md:text-base">
              With {about.yearsOfExperience} years of experience, our team brings care and craftsmanship to every arrangement.
            </p>
          ) : null}
          {about.story && <p className="whitespace-pre-line text-sm leading-relaxed text-soft-black md:text-base">{about.story}</p>}
          {about.founderName && <p className="text-sm text-taupe">— {about.founderName}, Founder</p>}
        </div>
      </section>

      {about.mission && (
        <section className="bg-white/60 section">
          <div className="container-kflore flex flex-col items-center gap-4 text-center">
            <span className="text-xs uppercase tracking-label text-burgundy">Our Mission</span>
            <p className="max-w-2xl font-serif-display text-2xl leading-relaxed text-soft-black md:text-3xl">
              {about.mission}
            </p>
          </div>
        </section>
      )}

      {about.values.length > 0 && (
        <section className="container-kflore section">
          <SectionHeading eyebrow="WHAT WE BELIEVE" title="Our Values" className="mx-auto mb-10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {about.values.map((v, i) => (
              <div key={i} className="border border-taupe/20 p-6 text-center">
                <p className="text-sm text-soft-black">{v}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-kflore flex flex-col items-center gap-6 pb-24 text-center">
        <p className="max-w-lg text-sm text-taupe">Ready to find the perfect arrangement for your moment?</p>
        <Button asChild size="lg">
          <Link href="/shop">SHOP FLOWERS</Link>
        </Button>
      </section>
    </div>
  );
}


