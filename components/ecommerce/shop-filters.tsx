import { Search } from "lucide-react";

interface CategoryOption {
  slug: string;
  name: string;
}

export function ShopFilters({
  categories,
  activeCategory,
  activeSort,
  activeSearch,
  inStockOnly,
}: {
  categories: CategoryOption[];
  activeCategory?: string;
  activeSort: string;
  activeSearch?: string;
  inStockOnly: boolean;
}) {
  return (
    <form method="GET" className="flex flex-col gap-4 border-y border-taupe/20 py-6 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
        <input
          type="search"
          name="q"
          defaultValue={activeSearch}
          placeholder="Search flowers…"
          className="focus-ring h-11 w-full border border-taupe/40 bg-white pl-9 pr-3 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select name="category" defaultValue={activeCategory ?? ""} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-xs uppercase tracking-label">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select name="sort" defaultValue={activeSort} className="focus-ring h-11 border border-taupe/40 bg-white px-3 text-xs uppercase tracking-label">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>

        <label className="flex items-center gap-2 text-xs uppercase tracking-label text-soft-black">
          <input type="checkbox" name="inStock" value="1" defaultChecked={inStockOnly} className="h-4 w-4 accent-[#5A1725]" />
          In Stock Only
        </label>

        <button type="submit" className="focus-ring h-11 bg-burgundy px-6 text-xs uppercase tracking-label text-ivory hover:bg-burgundy-light">
          Apply
        </button>
      </div>
    </form>
  );
}
