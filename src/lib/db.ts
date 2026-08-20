import { supabase } from "./supabase";
import type { Database } from "./supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type Offer = Database["public"]["Tables"]["offers"]["Row"];
type OfferInsert = Database["public"]["Tables"]["offers"]["Insert"];
type OfferUpdate = Database["public"]["Tables"]["offers"]["Update"];
type User = Database["public"]["Tables"]["users"]["Row"];

export type { Product, Order, Offer, User, OrderInsert };

/* ================================================================== */
/* Auth helpers                                                        */
/* ================================================================== */

/** Get the current authenticated user profile from the users table. */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as User | null;
}

/** Upsert user profile after sign-in (creates if missing). */
export async function ensureUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        name:
          user.user_metadata?.name ??
          user.user_metadata?.full_name ??
          null,
        image: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  return data as User | null;
}

/* ================================================================== */
/* Products                                                             */
/* ================================================================== */

export async function listProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createProduct(
  product: ProductInsert,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: ProductUpdate,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/* ================================================================== */
/* Orders                                                               */
/* ================================================================== */

export async function listMyOrders(): Promise<Order[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAssignedOrders(): Promise<Order[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("delivery_person_id", user.id)
    .not("status", "in", "(delivered,cancelled)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function placeOrder(
  order: Omit<OrderInsert, "id" | "user_id" | "created_at">,
): Promise<Order> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to place an order");

  const { data, error } = await supabase
    .from("orders")
    .insert({ ...order, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw error;
}

export async function assignDelivery(
  orderId: string,
  deliveryPersonId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ delivery_person_id: deliveryPersonId })
    .eq("id", orderId);
  if (error) throw error;
}

export async function rateOrder(
  orderId: string,
  rating: number,
  review?: string,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      rating,
      review: review || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw error;
}

/* ================================================================== */
/* Offers                                                               */
/* ================================================================== */

export async function listActiveOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function listAllOffers(): Promise<Offer[]> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function createOffer(
  offer: Omit<OfferInsert, "id" | "created_at">,
): Promise<Offer> {
  const { data, error } = await supabase
    .from("offers")
    .insert(offer)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOffer(
  id: string,
  updates: OfferUpdate,
): Promise<void> {
  const { error } = await supabase
    .from("offers")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw error;
}

/* ================================================================== */
/* Users / Roles                                                        */
/* ================================================================== */

export async function listUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function setUserRole(
  userId: string,
  role: User["role"],
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .upsert({ id: userId, role }, { onConflict: "id" });
  if (error) throw error;
}

export async function getRoleStatus() {
  const currentUser = await getCurrentUser();

  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  return {
    role: currentUser?.role ?? null,
    isAdmin: currentUser?.role === "admin",
    isDelivery: currentUser?.role === "delivery",
    adminExists: (count ?? 0) > 0,
  };
}

/* ================================================================== */
/* Supabase DB health check                                            */
/* ================================================================== */

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);
    if (error) throw error;
    return { connected: true, error: null };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
