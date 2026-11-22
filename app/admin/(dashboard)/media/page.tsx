import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { MediaLibraryClient } from "@/components/admin/media-library-client";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await db.select().from(media).orderBy(desc(media.createdAt)).limit(200);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Media Library</h1>
      <MediaLibraryClient items={items} />
    </div>
  );
}
