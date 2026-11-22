import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { buildProductOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn, formatPriceMYR } from "@/lib/utils";
import type { getActiveSignaturePick } from "@/lib/db/queries";

type Signature = NonNullable<Awaited<ReturnType<typeof getActiveSignaturePick>>>;

export function SignaturePick({ data, whatsappNumber }: { data: Signature; whatsappNumber: string }) {
  const { pick, product, images } = data;
  const title = pick.title || product?.name;
  if (!title) return null;

  const mainImage = pick.imageOverride || images[0]?.url || null;
  const mainAlt = (!pick.imageOverride && images[0]?.altText) || title;
  const secondImage = images[pick.imageOverride ? 0 : 1]?.url ?? null;

  const description = pick.description || product?.shortDescription || null;
  const details = [
    { label: "Perfect for", value: pick.occasion || product?.occasion },
    { label: "Palette", value: pick.palette || product?.colour },
    { label: "Featured flowers", value: pick.featuredFlowers || product?.flowerType },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value));

  const href = product ? `/product/${product.slug}` : "/shop";
  const whatsappHref = buildWhatsAppUrl(
    whatsappNumber,
    buildProductOrderMessage({ productName: title, quantity: 1, price: product ? formatPriceMYR(product.price) : null })
  );

  return (
    <section aria-labelledby="signature-heading" className="section-lg bg-burgundy/[0.045]">
      <div className="container-kflore">
        <div className="section-header mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-burgundy">This month&rsquo;s signature pick</p>
          <h2 id="signature-heading" className="font-serif-display text-4xl leading-[1.1] md:text-5xl">
            An arrangement chosen to define the season.
          </h2>
        </div>

        <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="relative lg:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e6dccd] sm:aspect-[5/6] lg:aspect-[6/7]">
              {mainImage && (
                <Image
                  src={mainImage}
                  alt={mainAlt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            {secondImage && (
              <div className="absolute -bottom-8 -right-4 hidden aspect-square w-[34%] overflow-hidden border-8 border-ivory bg-[#e6dccd] lg:block">
                <Image src={secondImage} alt="" fill sizes="20vw" className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-6 lg:col-span-5 lg:pl-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">{pick.eyebrow}</p>
            <div className="flex flex-col gap-3">
              <h3 className="font-serif-display text-4xl leading-[1.1] md:text-5xl">{title}</h3>
              {product && <p className="text-lg text-soft-black">{formatPriceMYR(product.price)}</p>}
            </div>
            {description && <p className="prose-editorial text-base leading-relaxed text-taupe">{description}</p>}

            {details.length > 0 && (
              <dl className="w-full divide-y divide-taupe/20 border-y border-taupe/20">
                {details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5 text-sm">
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-taupe">{d.label}</dt>
                    <dd className="text-soft-black">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-2 flex flex-wrap gap-3">
              <Link href={href} className={buttonVariants({ size: "lg" })}>
                {pick.ctaText}
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
