import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getSessionUser, isAdmin } from "./helpers";
import { ROLES, roleValidator } from "./schema";

/** Role info for the current user, plus whether an admin exists yet. */
export const roleStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .collect();
    return {
      role: user?.role ?? null,
      isAdmin: user?.role === ROLES.ADMIN,
      isDelivery: user?.role === ROLES.DELIVERY,
      adminExists: admins.length > 0,
    };
  },
});

/** Lets the very first user claim the admin role (bootstrap only). */
export const bootstrapAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .collect();
    if (admins.length > 0) throw new Error("An admin already exists");

    const user = await getSessionUser(ctx);
    if (!user) throw new Error("Sign in first");
    await ctx.db.patch(user._id, { role: ROLES.ADMIN });
  },
});

/** Admin-only: set or clear the role of any user (e.g. make a delivery person). */
export const setRole = mutation({
  args: { userId: v.id("users"), role: v.union(roleValidator, v.null()) },
  handler: async (ctx, { userId, role }) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    const target = await ctx.db.get(userId);
    if (!target) throw new Error("User not found");

    await ctx.db.patch(userId, role === null ? { role: undefined } : { role });
  },
});

/** Admin-only: all users, for the delivery-staff panel. */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");
    return await ctx.db.query("users").collect();
  },
});
