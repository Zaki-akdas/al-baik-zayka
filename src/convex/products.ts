import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getSessionUser, isAdmin } from "./helpers";
import { menuItems } from "../data/menu";

/**
 * Starter prices (₹) used only when the default menu is imported. The admin
 * can edit every price later from the Admin → Products panel.
 */
const SEED_PRICES: Record<string, number> = {
  "zayka-special-burger": 129,
  "classic-chicken-burger": 99,
  "cheese-loaded-burger": 119,
  "spicy-tandoori-burger": 119,
  "chicken-shawarma": 89,
  "zayka-special-wrap": 109,
  "double-chicken-wrap": 119,
  "margherita-pizza": 149,
  "zayka-special-pizza": 199,
  "spicy-chicken-pizza": 179,
  "loaded-fries": 99,
  "peri-peri-fries": 79,
  "cheesy-garlic-bread": 99,
  "zayka-combo": 249,
  "family-combo": 549,
  "shawarma-combo": 199,
  "cold-drinks": 40,
  "milkshakes": 79,
  "fresh-lime-soda": 39,
  "todays-special": 199,
  "zayka-special-plate": 249,
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

/** Imports the starter menu once. No-op when products already exist. */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return { seeded: false };

    for (const item of menuItems) {
      await ctx.db.insert("products", {
        name: item.name,
        category: item.category,
        description: item.description,
        price: SEED_PRICES[item.id] ?? 99,
        image: item.image,
        isAvailable: item.isAvailable ?? true,
        isPopular: item.isPopular ?? false,
        isOffer: item.isOffer ?? false,
        veg: item.veg,
      });
    }
    return { seeded: true };
  },
});

const productFields = {
  name: v.string(),
  category: v.string(),
  description: v.string(),
  price: v.number(),
  image: v.string(),
  isAvailable: v.boolean(),
  isPopular: v.optional(v.boolean()),
  isOffer: v.optional(v.boolean()),
  veg: v.optional(v.boolean()),
};

export const create = mutation({
  args: productFields,
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Only admins can manage the menu");
    await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: { id: v.id("products"), ...productFields },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Only admins can manage the menu");
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Product not found");
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Only admins can manage the menu");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Product not found");
    await ctx.db.delete(id);
  },
});
