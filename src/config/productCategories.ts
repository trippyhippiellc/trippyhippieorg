/*
  productCategories.ts — category definitions for the shop filter tabs.
  These are the UI labels only. Actual product availability is always
  driven by what exists in the Supabase database for the user's state.
  If no products exist in a category, the filter still shows — but the
  grid will display the empty state.
*/

export interface ProductCategory {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    value:       "flower",
    label:       "Flower",
    emoji:       "🌸",
    description: "THCa hemp flower, pre-rolls, and shake",
  },
  {
    value:       "vape",
    label:       "Vapes",
    emoji:       "💨",
    description: "Disposable vapes, cartridges, and pods",
  },
  {
    value:       "edible",
    label:       "Edibles",
    emoji:       "🍬",
    description: "Gummies, chocolates, and infused treats",
  },
  {
    value:       "accessory",
    label:       "Accessories",
    emoji:       "🛠️",
    description: "Pipes, papers, grinders, and more",
  },
  {
    value:       "other",
    label:       "Other",
    emoji:       "✨",
    description: "Tinctures, topicals, and specialty items",
  },
];

/* Hook-style export for use in ProductFilters */
export function useProductCategories() {
  return PRODUCT_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));
}

export default PRODUCT_CATEGORIES;
