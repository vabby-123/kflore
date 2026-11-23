export interface ProductImageDTO {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface ProductVariantDTO {
  id: string;
  name: string;
  sku?: string | null;
  price?: string | null;
  stock?: number | null;
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
}

/** Lean product shape for cards/grids (no variants, no long description). */
export interface ProductCardDTO {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: string;
  /** Lowest price across this product's variants, set only when prices actually vary — show as "From {priceFrom}". */
  priceFrom?: string | null;
  /** Variant / size labels in display order (S, M, L, XL …). */
  sizes?: string[];
  compareAtPrice?: string | null;
  stockStatus: string;
  featured: boolean;
  bestSeller: boolean;
  images: ProductImageDTO[];
  category: CategoryDTO | null;
}
