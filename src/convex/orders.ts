import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";
import { getSessionUser, isAdmin, isDelivery } from "./helpers";
import { ORDER_STATUSES } from "../data/orders";

const orderStatus = v.union(...ORDER_STATUSES.map((s) => v.literal(s)));

export const placeOrder = mutation({
  args: {
    items: v.array(
      v.object({ productId: v.id("products"), qty: v.number() }),
    ),
    customerName: v.string(),
    customerPhone: v.string(),
    address: v.string(),
    orderType: v.union(v.literal("delivery"), v.literal("pickup")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getSessionUser(ctx);
    if (!user) throw new Error("Sign in to place an order");

    const name = args.customerName.trim();
    const phone = args.customerPhone.trim();
    if (!name || !phone) throw new Error("Name and phone are required");

    // Recompute prices server-side so totals can't be tampered with.
    // The category is frozen onto the line so past orders keep the category
    // that was current when they were placed, even if the menu changes later.
    const lines: { productId: import("./_generated/dataModel").Id<"products">; name: string; category: string; qty: number; price: number }[] = [];
    let total = 0;
    for (const item of args.items) {
      if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
        throw new Error("Invalid quantity");
      }
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error("A product in your order no longer exists");
      if (!product.isAvailable) throw new Error(`${product.name} is currently unavailable`);
      lines.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        qty: item.qty,
        price: product.price,
      });
      total += product.price * item.qty;
    }
    if (lines.length === 0) throw new Error("Your order is empty");

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      customerName: name,
      customerPhone: phone,
      address: args.address.trim(),
      orderType: args.orderType,
      items: lines,
      total,
      status: "placed",
      notes: (args.notes ?? "").trim(),
      createdAt: Date.now(),
    });

    // Mirror new orders into Supabase for reporting/exports.
    await ctx.scheduler.runAfter(0, internal.supabase.syncOrdersDb);

    return { orderId };
  },
});

export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Internal: every order regardless of role. Used by the scheduled
 * Supabase auto-sync, which runs without a user session.
 */
export const all = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

/** All orders for the admin panel. */
export const adminList = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    return await ctx.db.query("orders").order("desc").collect();
  },
});

/** Orders assigned to the signed-in delivery person (or admin). */
export const myAssigned = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!user || (!isDelivery(user) && !isAdmin(user))) {
      throw new Error("Delivery staff only");
    }
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_delivery", (q) => q.eq("deliveryPersonId", user._id))
      .order("desc")
      .collect();
    return orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    );
  },
});

export const setStatus = mutation({
  args: { orderId: v.id("orders"), status: orderStatus },
  handler: async (ctx, { orderId, status }) => {
    const user = await getSessionUser(ctx);
    if (!user) throw new Error("Sign in first");
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const allowed =
      isAdmin(user) || order.deliveryPersonId === user._id;
    if (!allowed) throw new Error("You can only update your assigned orders");

    await ctx.db.patch(orderId, { status });

    // Keep the Supabase mirror in sync whenever the status changes.
    await ctx.scheduler.runAfter(0, internal.supabase.syncOrdersDb);
  },
});

export const rateOrder = mutation({
  args: {
    orderId: v.id("orders"),
    rating: v.number(),
    review: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, rating, review }) => {
    const user = await getSessionUser(ctx);
    if (!user) throw new Error("Sign in to rate an order");

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    // Only the order owner can rate their own order.
    if (order.userId !== user._id) {
      throw new Error("You can only rate your own orders");
    }

    // Only delivered orders can be rated.
    if (order.status !== "delivered") {
      throw new Error("Only delivered orders can be rated");
    }

    // Prevent re-rating if already rated.
    if (order.rating !== undefined) {
      throw new Error("This order has already been rated");
    }

    await ctx.db.patch(orderId, {
      rating,
      review: (review ?? "").trim() || undefined,
      reviewedAt: Date.now(),
    });

    return { success: true };
  },
});

export const assignDelivery = mutation({
  args: {
    orderId: v.id("orders"),
    deliveryPersonId: v.union(v.id("users"), v.null()),
  },
  handler: async (ctx, { orderId, deliveryPersonId }) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    if (deliveryPersonId !== null) {
      const deliveryUser = await ctx.db.get(deliveryPersonId);
      if (!deliveryUser || !isDelivery(deliveryUser)) {
        throw new Error("Select a delivery person");
      }
    }

    await ctx.db.patch(orderId, {
      deliveryPersonId: deliveryPersonId ?? undefined,
    });

    // The delivery assignment appears in exports — mirror it too.
    await ctx.scheduler.runAfter(0, internal.supabase.syncOrdersDb);
  },
});
