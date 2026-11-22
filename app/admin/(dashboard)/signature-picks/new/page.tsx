import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { SignaturePickForm } from "@/components/admin/signature-pick-form";
import { createSignaturePick } from "@/lib/actions/storefront";

export const dynamic = "force-dynamic";

export default async function NewSignaturePickPage() {
  const options = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.status, "PUBLISHED")).orderBy(asc(products.name));
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif-display text-2xl text-soft-black">New Signature Pick</h1>
      <SignaturePickForm action={createSignaturePick} productOptions={options} />
    </div>
  );
}