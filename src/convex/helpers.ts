import { getAuthUserId } from "@convex-dev/auth/server";
import { MutationCtx, QueryCtx } from "./_generated/server";

/** Current signed-in user or null. Works in queries and mutations. */
export async function getSessionUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
}

export function isAdmin(
  user: { role?: string | null } | null | undefined,
): boolean {
  return user?.role === "admin";
}

export function isDelivery(
  user: { role?: string | null } | null | undefined,
): boolean {
  return user?.role === "delivery";
}
