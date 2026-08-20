import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — Supabase features will not work.",
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
);

/* ------------------------------------------------------------------ */
/* Database types — auto-generate with `supabase gen types typescript` */
/* ------------------------------------------------------------------ */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          image: string | null;
          role: "admin" | "user" | "delivery" | "member" | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          image?: string | null;
          role?: "admin" | "user" | "delivery" | "member" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          image?: string | null;
          role?: "admin" | "user" | "delivery" | "member" | null;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          price: number;
          price_half: number | null;
          image: string;
          is_available: boolean;
          is_popular: boolean;
          is_offer: boolean;
          veg: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description: string;
          price: number;
          price_half?: number | null;
          image: string;
          is_available?: boolean;
          is_popular?: boolean;
          is_offer?: boolean;
          veg?: boolean | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          description?: string;
          price?: number;
          price_half?: number | null;
          image?: string;
          is_available?: boolean;
          is_popular?: boolean;
          is_offer?: boolean;
          veg?: boolean | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_name: string;
          customer_phone: string;
          address: string;
          order_type: "delivery" | "pickup";
          items: Array<{
            product_id: string;
            name: string;
            category: string;
            qty: number;
            price: number;
          }>;
          total: number;
          status:
            | "placed"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          delivery_person_id: string | null;
          notes: string | null;
          rating: number | null;
          review: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_name: string;
          customer_phone: string;
          address: string;
          order_type: "delivery" | "pickup";
          items: Array<{
            product_id: string;
            name: string;
            category: string;
            qty: number;
            price: number;
          }>;
          total: number;
          status?:
            | "placed"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          delivery_person_id?: string | null;
          notes?: string | null;
          rating?: number | null;
          review?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?:
            | "placed"
            | "confirmed"
            | "preparing"
            | "out_for_delivery"
            | "delivered"
            | "cancelled";
          delivery_person_id?: string | null;
          rating?: number | null;
          review?: string | null;
          reviewed_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string | null;
          sort_order?: number;
        };
      };
      offers: {
        Row: {
          id: string;
          title: string;
          badge: "COMBO" | "TODAY'S SPECIAL" | "LIMITED OFFER" | "NEW";
          description: string;
          price: number | null;
          original_price: number | null;
          image: string;
          valid_until: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          badge: "COMBO" | "TODAY'S SPECIAL" | "LIMITED OFFER" | "NEW";
          description: string;
          price?: number | null;
          original_price?: number | null;
          image: string;
          valid_until?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          badge?: "COMBO" | "TODAY'S SPECIAL" | "LIMITED OFFER" | "NEW";
          description?: string;
          price?: number | null;
          original_price?: number | null;
          image?: string;
          valid_until?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
    };
  };
}
