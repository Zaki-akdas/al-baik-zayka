import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { ORDER_STATUSES } from "../data/orders";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
  DELIVERY: "delivery",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
  v.literal(ROLES.DELIVERY),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /** Menu products — managed by the restaurant admin. */
    products: defineTable({
      name: v.string(),
      category: v.string(),
      description: v.string(),
      price: v.number(), // ₹
      priceHalf: v.optional(v.number()), // ₹ half-size price for H/F items
      image: v.string(),
      isAvailable: v.boolean(),
      isPopular: v.optional(v.boolean()),
      isOffer: v.optional(v.boolean()),
      veg: v.optional(v.boolean()), // true = veg, false = non-veg
    }).index("by_category", ["category"]),

    /** Customer orders with a delivery-person assignment. */
    orders: defineTable({
      userId: v.id("users"),
      customerName: v.string(),
      customerPhone: v.string(),
      address: v.string(),
      orderType: v.union(v.literal("delivery"), v.literal("pickup")),
      items: v.array(
        v.object({
          productId: v.id("products"),
          name: v.string(),
          // Category is frozen onto the line at order time so past orders
          // keep the category that was current when they were placed.
          category: v.string(),
          qty: v.number(),
          price: v.number(),
        }),
      ),
      total: v.number(),
      status: v.union(...ORDER_STATUSES.map((s) => v.literal(s))),
      deliveryPersonId: v.optional(v.id("users")),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_delivery", ["deliveryPersonId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
