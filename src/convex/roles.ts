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

/** Create or promote an admin account by email.
 *  - If no admin exists, any signed-in user can call this to promote a user by email.
 *  - If an admin already exists, only an admin can call this.
 */
export const createAdminAccount = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .collect();

    const target = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!target) {
      throw new Error(
        `User with email "${email}" not found. They must sign in first.`
      );
    }

    if (admins.length > 0) {
      const caller = await getSessionUser(ctx);
      if (!isAdmin(caller)) {
        throw new Error(
          "An admin already exists. Only admins can create more admins."
        );
      }
    }

    await ctx.db.patch(target._id, { role: ROLES.ADMIN });
    return { success: true, userId: target._id };
  },
});

/** Admin-only: remove the admin role from every user.
 *  Use this to reset admin state (e.g. before re-assigning admins).
 *  If you are locked out, sign in as an existing admin first — or patch the
 *  local DB directly with the Convex CLI as a last resort.
 */
export const resetAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getSessionUser(ctx);
    if (!isAdmin(user)) throw new Error("Admins only");

    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.ADMIN))
      .collect();

    await Promise.all(
      admins.map((user) => ctx.db.patch(user._id, { role: undefined }))
    );

    return { success: true, cleared: admins.length };
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
