import { useEffect, useMemo, useState } from "react";
import { listProducts, listCategories, type Product, type Category } from "@/lib/db";
import { menuItems, categoryIcons as staticIcons, type MenuItem, type MenuCategoryName } from "@/data/menu";

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
      priceHalf: db?.price_half != null ? db.price_half : item.priceHalf,
      isAvailable: db?.is_available ?? item.isAvailable,
    };
  });
}

/**
 * Returns { items, categories, categoryIcons, fromDb } — the API that
 * MenuSection and other components depend on.
 */
export function useMenuItems() {
  const items = useMenu();
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories()
      .then(setDbCategories)
      .catch(() => setDbCategories([]));
  }, []);

  const fromDb = useMemo(() => items.some((i) => i.price !== undefined), [items]);

  const { categories, categoryIcons } = useMemo(() => {
    if (dbCategories.length > 0) {
      const icons: Record<string, string> = {};
      const cats = dbCategories.map((c) => {
        if (c.icon) icons[c.name] = c.icon;
        return c.name;
      });
      return { categories: cats, categoryIcons: icons };
    }
    // Fall back to extracting from items
    const catSet = new Set<MenuCategoryName>();
    for (const item of items) {
      catSet.add(item.category);
    }
    return { categories: [...catSet], categoryIcons: staticIcons };
  }, [dbCategories, items]);

  return { items, categories, categoryIcons, fromDb };
}
