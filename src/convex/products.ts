import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getSessionUser, isAdmin } from "./helpers";
import { menuItems } from "../data/menu";

/**
 * Starter prices (₹) used only when the default menu is imported. The admin
 * can edit every price later from the Admin → Products panel.
 */
const SEED_PRICES: Record<string, number> = {
  // ── ABZ Specials ────────────────────────────────────────────────
  "abz-special-chicken-jumbo-twister": 150,
  "abz-special-chicken-jumbo-shawarma": 140,
  "abz-special-chicken-king-burger": 130,
  "abz-special-chi-jumbo-sandwich": 140,
  "abz-special-loded-king-jumbo-sandwich": 200,
  "abz-special-chicken-chesse-loded-pizza": 250,
  "abz-special-chicken-chesse-pizza": 200,
  "abz-special-chicken-tocco": 150,

  // ── Cold Coffee ─────────────────────────────────────────────────
  "cold-coffee": 70,
  "cold-coffee-thick-shake": 80,
  "cold-coffee-thick-shake-with-ice-cream": 100,
  "kitkat-shake": 100,

  // ── Beverages & Desserts ────────────────────────────────────────
  "mojito": 80,
  "choco-lawa-cake": 80,

  // ── Maggi ───────────────────────────────────────────────────────
  "plain-maggi": 60,
  "veg-maggi": 80,
  "veg-che-maggi": 120,
  "chicken-maggi": 120,
  "chicken-che-maggi": 150,

  // ── Snacks & Fries ─────────────────────────────────────────────
  "chicken-popcorn": 80,
  "chicken-boneless": 100,
  "chicken-hot-wings-4pcs": 80,
  "chicken-lollipop-4pcs": 100,
  "chicken-nuggets-10-pcs": 120,
  "french-fries-salted": 70,
  "chet-masala-fries": 80,
  "peri-peri-fries": 80,
  "veg-fry-momo-s": 80,

  // ── Tacco ───────────────────────────────────────────────────────
  "chicken-crunchy-tacco": 120,
  "chicken-crunchy-cheese-tacco": 130,
  "chicken-crunchy-corn-cheese-tacco": 130,
  "chicken-crunchy-corn-cheese-double-tacco": 140,

  // ── Loaded ──────────────────────────────────────────────────────
  "mini-loaded": 100,
  "loaded": 150,
  "only-chicken-loaded": 200,

  // ── Twister Rolls ───────────────────────────────────────────────
  "chicken-twister": 90,
  "chicken-cheese-twister": 100,
  "schezwan-chicken-twister": 100,
  "chicken-sch-egg-roll-twister": 150,
  "chicken-egg-roll-twister": 150,
  "chi-ch-sch-egg-roll-twister": 160,
  "veg-twister": 80,
  "veg-cheese-twister": 100,
  "veg-schezwan-twister": 100,
  "veg-cheese-sch-twister": 120,

  // ── Sandwich ────────────────────────────────────────────────────
  "white-chicken-sandwich": 80,
  "white-chicken-cheese-sandwich": 100,
  "white-jubbo-chicken-sandwich": 120,
  "chicken-schezwon-sandwich": 100,
  "chicken-sch-cheese-sandwich": 120,
  "chicken-egg-sandwich": 120,
  "chicken-egg-ch-sandwich": 140,
  "veg-sandwich": 80,
  "veg-schezwan-sandwich": 100,
  "veg-cheese-schezwan-sandwich": 120,
  "veg-cheese-sandwich": 100,
  "paneer-sandwich": 150,
  "paneer-ch-sandwich": 150,
  "paneer-ch-schez-sandwich": 170,

  // ── Burger ──────────────────────────────────────────────────────
  "chicken-burger": 80,
  "chicken-cheese-burger": 100,
  "schezwan-chicken-burger": 90,
  "grilled-chicken-burger": 90,
  "chicken-egg-burger": 130,
  "veg-burger": 80,
  "veg-schezwan-burger": 100,
  "veg-cheese-burger": 100,
  "veg-cheese-schezwan-burger": 120,

  // ── Pizza ───────────────────────────────────────────────────────
  "chicken-pizza": 100,
  "chicken-cheese-pizza": 130,
  "chicken-double-che-pizza": 150,
  "paneer-pizza": 130,
  "tomato-cheese-pizza": 100,
  "capycum-cheese-pizza": 100,
  "onion-cheese-pizza": 100,
  "margherita-pizza": 100,
  "corn-pizza": 100,
  "veg-pizza": 100,
  "veg-cheese-pizza": 120,
  "veg-schezwon-pizza": 120,

  // ── Chicken (H/F) ──────────────────────────────────────────────
  "chicken-noodles": 140,
  "chicken-hakka-noodles": 140,
  "chicken-crispy-noodles": 150,
  "chicken-soya-chilly": 140,
  "chicken-dragon-potato-chilly": 140,
  "chicken-fried-rice": 160,
  "chicken-schezwan-fried-rice": 170,
  "chicken-manchurian": 160,
  "chicken-mixed-combi": 180,
  "chicken-chilli-garlic-noodles": 160,
  "chicken-white-sauce-pasta": 320,

  // ── Egg (H/F) ──────────────────────────────────────────────────
  "egg-noodles": 90,
  "egg-schezwan-noodles": 100,
  "egg-hakka-noodles": 100,
  "egg-crispy-noodles": 100,
  "egg-manchurian-noodles": 100,
  "egg-fried-rice": 90,
  "egg-schezwan-fried-rice": 100,
  "egg-manchurian-fried-rice": 100,
  "egg-dry-manchurian": 110,
  "egg-soya-chilly": 100,
  "egg-pasta-macaroni": 100,
  "egg-dragon-potato-chilly": 110,

  // ── Veg (H/F) ──────────────────────────────────────────────────
  "noodles": 60,
  "hakka-noodles": 90,
  "schezwan-noodles": 90,
  "crispy-noodles": 90,
  "manchurian-noodles": 90,
  "fried-rice": 60,
  "schezwan-fried-rice": 90,
  "manchurian-fried-rice": 90,
  "dry-manchurian": 70,
  "gravy-manchurian": 70,
  "mixed-combo": 100,
  "soya-chilly": 60,
  "dragon-potato-chilly": 90,
  "pasta-macaroni": 60,
  "white-sauce-pasta": 150,
  "veg-cheese-pasta": 150,
  "veg-fried-momos": 80,
  "veg-chilly-fried-momos": 110,

  // ── Rolls ───────────────────────────────────────────────────────
  "single-egg-vegetable-roll": 40,
  "double-egg-vegetable-roll": 50,
  "single-chowmein-roll": 50,
  "double-chowmein-roll": 60,
  "single-combo-roll": 70,
  "double-combo-roll": 80,
  "single-paneer-roll": 120,
  "double-paneer-roll": 130,
  "single-chicken-roll": 110,
  "double-chicken-roll": 120,
  "single-dragon-potato-roll": 60,
  "double-dragon-potato-roll": 70,

  // ── Soup ────────────────────────────────────────────────────────
  "tomato-soup": 60,
  "veg-manchau-soup": 60,
  "veg-sweet-corn-soup": 70,
  "veg-garlic-soup": 60,
  "veg-manchurian-soup": 60,
  "chicken-soup": 80,
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
        ...(item.priceHalf != null ? { priceHalf: item.priceHalf } : {}),
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
  priceHalf: v.optional(v.number()),
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
