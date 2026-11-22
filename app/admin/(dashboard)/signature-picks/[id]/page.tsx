import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, signaturePicks } from "@/lib/db/schema";
import { SignaturePickForm } from "@/components/admin/signature-pick-form";
import { updateSignaturePick } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function EditSignaturePickPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [[pick], options] = await Promise.all([
    db.select().from(signaturePicks).where(eq(signaturePicks.id, id)),
    db.select({ id: products.id, name: products.name }).from(products).where(eq(products.status, "PUBLISHED")).orderBy(asc(products.name)),
  ]);
  if (!pick) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">Edit Signature Pick</h1>
      <SignaturePickForm action={updateSignaturePick.bind(null, id)} initial={pick} productOptions={options} />
    </div>
  );
}