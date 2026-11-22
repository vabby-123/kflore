import Link from "next/link";
import Image from "next/image";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteHeroSlide } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage() {
  const rows = await db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-2xl text-soft-black">Hero Slides</h1>
        <Button asChild size="sm">
          <Link href="/admin/hero-slides/new">
            <Plus className="h-4 w-4" /> New Slide
          </Link>
        </Button>
      </div>
      <p className="text-sm text-taupe">The first five active slides (by sort order) form the homepage carousel.</p>

      <DataTable
        rows={rows}
        emptyMessage="No slides yet. The homepage shows a plain fallback until you add one."
        columns={[
          {
            header: "",
            render: (s) => (
              <div className="relative h-12 w-20 overflow-hidden bg-ivory">
                <Image src={s.image} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ),
          },
          { header: "Title", render: (s) => <Link href={`/admin/hero-slides/${s.id}`} className="focus-ring font-medium hover:text-burgundy">{s.title}</Link> },
          { header: "Order", render: (s) => s.sortOrder },
          { header: "Status", render: (s) => <Badge variant={s.active ? "gold" : "muted"}>{s.active ? "ACTIVE" : "HIDDEN"}</Badge> },
          { header: "", className: "text-right", render: (s) => <ConfirmDeleteButton itemLabel={s.title} action={deleteHeroSlide.bind(null, s.id)} /> },
        ]}
      />
    </div>
  );
}