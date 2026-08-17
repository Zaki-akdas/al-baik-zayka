import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  menuCategories,
  menuItems as staticMenuItems,
  type MenuItem,
} from "@/data/menu";

type Product = Doc<"products">;

function toMenuItem(p: Product): MenuItem {
  return {
    id: p._id,
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    image: p.image,
    isPopular: p.isPopular ?? false,
    isOffer: p.isOffer ?? false,
    isAvailable: p.isAvailable,
    veg: p.veg ?? undefined,
  };
}

/**
 * Menu items from the Convex products table (managed by the admin). Falls
 * back to the static starter menu until the restaurant imports/seeds
 * products — the site is never empty.
 */
export function useMenuItems() {
  const products = useQuery(api.products.list);
  const loading = products === undefined;
  const fromDb = !!products && products.length > 0;

  const items: MenuItem[] = fromDb
    ? products!.map(toMenuItem)
    : staticMenuItems;

  const categories: string[] = fromDb
    ? [...new Set(items.map((i) => i.category))]
    : [...menuCategories];

  return { items, categories, loading, fromDb };
}
