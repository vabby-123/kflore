"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import { slugify } from "@/lib/utils";
import type { FormActionState } from "@/lib/actions/categories";

interface Variant {
  name: string;
  sku?: string;
  price?: number;
  stock?: number;
}

interface CategoryOption {
  id: string;
  name: string;
}
interface CollectionOption {
  id: string;
  name: string;
}

export function ProductForm({
  action,
  categories,
  collectionsList,
  initial,
}: {
  action: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
  categories: CategoryOption[];
  collectionsList: CollectionOption[];
  initial?: {
    name: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    price: string;
    compareAtPrice?: string | null;
    categoryId?: string | null;
    tags: string[];
    featured: boolean;
    bestSeller: boolean;
    status: string;
    stockStatus: string;
    occasion?: string | null;
    flowerType?: string | null;
    colour?: string | null;
    size?: string | null;
    deliveryEligible: boolean;
    images: UploadedImage[];
    variants: Variant[];
    collectionIds: string[];
  };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { success: false });
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(initial?.variants ?? []);
  const [collectionIds, setCollectionIds] = useState<string[]>(initial?.collectionIds ?? []);

  if (state.success && state.message) {
    toast.success(state.message);
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <input type="hidden" name="collectionIdsJson" value={JSON.stringify(collectionIds)} />

      <section className="grid gap-5 border border-taupe/15 bg-white p-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          {state.fieldErrors?.name && <p className="text-xs text-burgundy">{state.fieldErrors.name[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
          {state.fieldErrors?.slug && <p className="text-xs text-burgundy">{state.fieldErrors.slug[0]}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={initial?.shortDescription ?? ""} maxLength={200} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={5} defaultValue={initial?.description ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price (RM)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={initial?.price ?? ""} />
          {state.fieldErrors?.price && <p className="text-xs text-burgundy">{state.fieldErrors.price[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compareAtPrice">Compare-at Price (RM)</Label>
          <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={initial?.compareAtPrice ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={initial?.categoryId ?? ""} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" defaultValue={initial?.tags.join(", ") ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="occasion">Occasion</Label>
          <Input id="occasion" name="occasion" defaultValue={initial?.occasion ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="flowerType">Flower Type</Label>
          <Input id="flowerType" name="flowerType" defaultValue={initial?.flowerType ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="colour">Colour</Label>
          <Input id="colour" name="colour" defaultValue={initial?.colour ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="size">Size</Label>
          <Input id="size" name="size" defaultValue={initial?.size ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={initial?.status ?? "PUBLISHED"} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stockStatus">Stock Status</Label>
          <select id="stockStatus" name="stockStatus" defaultValue={initial?.stockStatus ?? "IN_STOCK"} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-sm">
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="MADE_TO_ORDER">Made to Order</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="h-4 w-4 accent-[#5A1725]" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="bestSeller" defaultChecked={initial?.bestSeller} className="h-4 w-4 accent-[#5A1725]" /> Best Seller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="deliveryEligible" defaultChecked={initial?.deliveryEligible ?? true} className="h-4 w-4 accent-[#5A1725]" /> Delivery Eligible
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3 border border-taupe/15 bg-white p-6">
        <Label>Images</Label>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section className="flex flex-col gap-3 border border-taupe/15 bg-white p-6">
        <div className="flex items-center justify-between">
          <Label>Variants (e.g. sizes)</Label>
          <Button type="button" variant="secondary" size="sm" onClick={() => setVariants([...variants, { name: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add Variant
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-taupe">Quick add:</span>
          {["S", "M", "L", "XL"].map((size) => (
            <button
              key={size}
              type="button"
              disabled={variants.some((v) => v.name === size)}
              onClick={() => setVariants([...variants, { name: size }])}
              className="focus-ring border border-taupe/40 px-3 py-1 text-xs uppercase tracking-label text-soft-black hover:border-burgundy hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-40"
            >
              {size}
            </button>
          ))}
        </div>
        {variants.length === 0 && <p className="text-xs text-taupe">No variants — the product will sell as a single option.</p>}
        {variants.map((v, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Name (e.g. Large)"
              value={v.name}
              onChange={(e) => setVariants(variants.map((vv, idx) => (idx === i ? { ...vv, name: e.target.value } : vv)))}
              className="max-w-[180px]"
            />
            <Input
              placeholder="Price override (RM)"
              type="number"
              step="0.01"
              value={v.price ?? ""}
              onChange={(e) => setVariants(variants.map((vv, idx) => (idx === i ? { ...vv, price: e.target.value ? parseFloat(e.target.value) : undefined } : vv)))}
              className="max-w-[160px]"
            />
            <Input
              placeholder="Stock"
              type="number"
              value={v.stock ?? ""}
              onChange={(e) => setVariants(variants.map((vv, idx) => (idx === i ? { ...vv, stock: e.target.value ? parseInt(e.target.value) : undefined } : vv)))}
              className="max-w-[120px]"
            />
            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="focus-ring text-taupe hover:text-burgundy">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 border border-taupe/15 bg-white p-6">
        <Label>Collections</Label>
        <div className="flex flex-wrap gap-3">
          {collectionsList.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collectionIds.includes(c.id)}
                onChange={(e) =>
                  setCollectionIds(e.target.checked ? [...collectionIds, c.id] : collectionIds.filter((id) => id !== c.id))
                }
                className="h-4 w-4 accent-[#5A1725]"
              />
              {c.name}
            </label>
          ))}
        </div>
      </section>

      {!state.success && state.message && <p className="text-sm text-burgundy">{state.message}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "SAVING…" : "SAVE PRODUCT"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
