import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getSessionUser, isAdmin } from "./helpers";

const badgeValidator = v.union(
  v.literal("COMBO"),
  v.literal("TODAY'S SPECIAL"),
  v.literal("LIMITED OFFER"),
  v.literal("NEW"),
);

/** Public: all active offers, sorted by sortOrder. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("offers")
      .collect()
      .then((offers) =>
        offers
          .filter((o) => o.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
  },
});

/** Admin: all offers including inactive. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    return await ctx.db
      .query("offers")
      .collect()
      .then((offers) => offers.sort((a, b) => a.sortOrder - b.sortOrder));
  },
});

/** Admin: create a new offer. */
export const create = mutation({
  args: {
    title: v.string(),
    badge: badgeValidator,
    description: v.string(),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    image: v.string(),
    validUntil: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");

    // Auto-assign sortOrder if not provided
    const existing = await ctx.db.query("offers").collect();
    const maxSort = existing.reduce((max, o) => Math.max(max, o.sortOrder), 0);

    const id = await ctx.db.insert("offers", {
      title: args.title.trim(),
      badge: args.badge,
      description: args.description.trim(),
      price: args.price,
      originalPrice: args.originalPrice,
      image: args.image.trim(),
      validUntil: args.validUntil,
      isActive: args.isActive,
      sortOrder: args.sortOrder ?? maxSort + 1,
      createdAt: Date.now(),
    });
    return { id };
  },
});

/** Admin: update an existing offer. */
export const update = mutation({
  args: {
    id: v.id("offers"),
    title: v.optional(v.string()),
    badge: v.optional(badgeValidator),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    image: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");

    const { id, ...fields } = args;
    const offer = await ctx.db.get(id);
    if (!offer) throw new Error("Offer not found");

    const patch: Record<string, unknown> = {};
    if (fields.title !== undefined) patch.title = fields.title.trim();
    if (fields.badge !== undefined) patch.badge = fields.badge;
    if (fields.description !== undefined) patch.description = fields.description.trim();
    if (fields.price !== undefined) patch.price = fields.price;
    if (fields.originalPrice !== undefined) patch.originalPrice = fields.originalPrice;
    if (fields.image !== undefined) patch.image = fields.image.trim();
    if (fields.validUntil !== undefined) patch.validUntil = fields.validUntil;
    if (fields.isActive !== undefined) patch.isActive = fields.isActive;
    if (fields.sortOrder !== undefined) patch.sortOrder = fields.sortOrder;

    await ctx.db.patch(id, patch);
    return { success: true };
  },
});

/** Admin: delete an offer. */
export const remove = mutation({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/** Admin: seed the static offers into the database if no offers exist yet. */
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");

    const existing = await ctx.db.query("offers").collect();
    if (existing.length > 0) {
      return { seeded: false, count: 0 };
    }

    const img = (id: string, w = 1100) =>
      `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

    const defaults = [
      {
        title: "Zayka Special",
        badge: "COMBO" as const,
        description:
          "Our signature combo — the burger, fries and drink that started it all. Ask us about today's combo deal.",
        image: img("photo-1594212699903-ec8a3eca50f5"),
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Today's Special",
        badge: "TODAY'S SPECIAL" as const,
        description:
          "A rotating pick straight from the kitchen. Check Instagram or ask at the counter for what's on today.",
        image: img("photo-1544025162-d76694265947"),
        isActive: true,
        sortOrder: 2,
      },
      {
        title: "Value Combo",
        badge: "COMBO" as const,
        description:
          "Smart eats for everyday cravings — grab a filling combo without breaking the bank.",
        image: img("photo-1607013251379-e6eecfffe234"),
        isActive: true,
        sortOrder: 3,
      },
      {
        title: "Family Combo",
        badge: "COMBO" as const,
        description:
          "Enough to feed the whole crew — burgers, wraps, fries and more for the table.",
        image: img("photo-1562967914-608f82629710"),
        isActive: true,
        sortOrder: 4,
      },
      {
        title: "Weekend Offer",
        badge: "LIMITED OFFER" as const,
        description:
          "Weekend-only cravings, posted fresh on Instagram. Follow @albaik_zayka so you never miss it.",
        image: img("photo-1565299624946-b28f40a0ae38"),
        isActive: true,
        sortOrder: 5,
      },
    ];

    const now = Date.now();
    for (const offer of defaults) {
      await ctx.db.insert("offers", { ...offer, createdAt: now });
    }
    return { seeded: true, count: defaults.length };
  },
});
