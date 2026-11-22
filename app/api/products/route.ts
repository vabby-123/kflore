import { NextRequest, NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await getPublishedProducts({ search: q.slice(0, 80), limit: 8 });
  return NextResponse.json(
    {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images[0]?.url ?? null,
        category: p.category?.name ?? null,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
