import { useEffect, useMemo, useState } from "react";
import { listProducts, type Product } from "@/lib/db";
import { menuItems, type MenuItem, type MenuCategoryName } from "@/data/menu";

/**
 * Returns the merged menu: Supabase products (if any) overlaid on the
 * static fallback data. The admin-managed prices and availability from
 * Supabase take precedence over the static defaults.
 */
export function useMenu(): MenuItem[] {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    listProducts()
      .then(setDbProducts)
      .catch(() => setDbProducts([]));
  }, []);

  if (dbProducts.length === 0) return menuItems;

  const byName = new Map(
    dbProducts.map((p) => [p.name.toLowerCase().trim(), p]),
  );

  return menuItems.map((item) => {
    const db = byName.get(item.name.toLowerCase().trim());
    return {
      ...item,
      price: db?.price ?? item.price,
      isAvailable: db?.is_available ?? item.isAvailable,
    };
  });
}

/**
 * Returns { items, categories, fromDb } — the old API that CartDrawer,
 * FeaturedFood and MenuSection depend on.
 */
export function useMenuItems() {
  const items = useMenu();
  const fromDb = useMemo(() => items.some((i) => i.price !== undefined), [items]);

  const categories = useMemo(() => {
    const catSet = new Set<MenuCategoryName>();
    for (const item of items) {
      catSet.add(item.category);
    }
    return [...catSet];
  }, [items]);

  return { items, categories, fromDb };
}
