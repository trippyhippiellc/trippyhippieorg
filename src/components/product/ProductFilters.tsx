"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { useProductCategories } from "@/config/productCategories";
import { cn } from "@/lib/utils/cn";

/*
  ProductFilters — search bar + category tabs + sort dropdown.
  All state lives in the parent (shop page) and flows down as props.
*/

interface ProductFiltersProps {
  search:      string;
  category:    string;
  sort:        string;
  onSearch:    (v: string) => void;
  onCategory:  (v: string) => void;
  onSort:      (v: string) => void;
  resultCount?: number;
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "popular",    label: "Most Popular" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export function ProductFilters({
  search,
  category,
  sort,
  onSearch,
  onCategory,
  onSort,
  resultCount,
}: ProductFiltersProps) {
  const categories = [{ value: "all", label: "All Products" }, ...useProductCategories()];

  return (
    <div className="space-y-4">
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-cream-dark pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products…"
            className={cn(
              "w-full h-10 pl-9 pr-9 text-sm",
              "bg-[#162816] border border-white/10 rounded-brand",
              "text-brand-cream placeholder:text-brand-cream-dark",
              "focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
              "transition-all"
            )}
          />
          {search && (
            <button
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-cream-dark hover:text-brand-cream transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="w-full sm:w-48">
          <Select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategory(cat.value)}
            className={cn(
              "px-3 py-1.5 rounded-pill text-sm font-medium transition-all border",
              category === cat.value
                ? "bg-brand-green text-white border-brand-green"
                : "bg-transparent text-brand-cream-muted border-white/10 hover:border-brand-green/30 hover:text-brand-cream"
            )}
          >
            {cat.label}
          </button>
        ))}

        {/* Result count */}
        {resultCount !== undefined && (
          <span className="ml-auto text-xs text-brand-cream-dark flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductFilters;
