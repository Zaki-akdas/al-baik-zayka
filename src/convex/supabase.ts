"use node";

import { Pool } from "pg";

import { api, internal } from "./_generated/api";
import { ActionCtx, action, internalAction } from "./_generated/server";

/** Result of the connection-status check, shown in the Admin panel. */
export interface DbStatusResult {
  connected: boolean;
  error: string | null;
  database: string | null;
  version: string | null;
  tables: string[];
}

/** Result of syncing Convex orders into the Supabase orders table. */
export interface SyncResult {
  synced: number;
  total: number;
  table: string;
  /** True when the sync was skipped (e.g. DATABASE_URL not configured yet). */
  skipped?: boolean;
  reason?: string;
}

/** Result of the CSV export read from Supabase. */
export interface ExportResult {
  csv: string;
  count: number;
  filename: string;
}

/** The Supabase table that mirrors Convex orders for reporting/exports. */
const ORDERS_TABLE = "orders";

const ORDERS_DDL = `
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  order_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  delivery_person_id TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at BIGINT NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`;

/**
 * Builds a pg Pool from environment variables. Prefers a single
 * `DATABASE_URL` connection string; falls back to individual
 * SUPABASE_HOST / SUPABASE_PORT / SUPABASE_DB / SUPABASE_USER /
 * SUPABASE_PASSWORD values. Secrets live in env vars (set via the
 * project's Keys tab) — never in source.
 *
 * Supabase's direct `db.<ref>.supabase.co` host is IPv6-only, so use the
 * dual-stack pooler host (`aws-0-<region>.pooler.supabase.com`) in the
 * connection string for IPv4-only networks. For this project the working
 * pooler string is:
 *
 *   postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
 *
 * (user = `postgres.<project-ref>`, port 5432 = session mode; port 6543 =
 * transaction mode). Paste it into the project Keys tab as `DATABASE_URL`.
 */
function buildPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
      max: 1,
    });
  }

  const host = process.env.SUPABASE_HOST;
  const user = process.env.SUPABASE_USER;
  const password = process.env.SUPABASE_PASSWORD;
  if (!host || !user || !password) return null;

  return new Pool({
    host,
    port: Number(process.env.SUPABASE_PORT ?? 5432),
    database: process.env.SUPABASE_DB ?? "postgres",
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    max: 1,
  });
}

/** Admin-only guard shared by every action in this file. */
async function requireAdmin(ctx: ActionCtx) {
  const user = await ctx.runQuery(api.users.currentUser);
  if (!user || user.role !== "admin") {
    throw new Error("Admins only");
  }
}

/** Admin-only: test the Postgres connection and list public tables. */
export const status = action({
  args: {},
  handler: async (ctx): Promise<DbStatusResult> => {
    try {
      await requireAdmin(ctx);
    } catch {
      return {
        connected: false,
        error: "Admins only",
        database: null,
        version: null,
        tables: [],
      };
    }

    const pool = buildPool();
    if (!pool) {
      return {
        connected: false,
        error:
          "Database env vars are not set. Add DATABASE_URL in the project Keys tab — e.g. postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres (use the pooler host, not the IPv6-only direct host).",
        database: null,
        version: null,
        tables: [],
      };
    }

    try {
      const info = await pool.query(
        "SELECT current_database() AS db, version() AS version",
      );
      const tables = await pool.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
      );
      return {
        connected: true,
        error: null,
        database: (info.rows[0]?.db as string | undefined) ?? null,
        version: (info.rows[0]?.version as string | undefined) ?? null,
        tables: tables.rows.map((r) => r.tablename as string),
      };
    } catch (err) {
      return {
        connected: false,
        error: err instanceof Error ? err.message : String(err),
        database: null,
        version: null,
        tables: [],
      };
    } finally {
      await pool.end().catch(() => {});
    }
  },
});

/**
 * Internal: mirror every Convex order into the Supabase `orders` table.
 * Creates the table on first run. Orders that no longer exist in Convex are
 * left in place so history is never silently lost.
 *
 * No auth checks — only reachable via `internal.` (scheduled from order
 * mutations or delegated from the admin-gated `syncOrders` action).
 */
export const syncOrdersDb = internalAction({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    const orders = await ctx.runQuery(internal.orders.all);

    const pool = buildPool();
    if (!pool) {
      return {
        synced: 0,
        total: orders.length,
        table: ORDERS_TABLE,
        skipped: true,
        reason: "DATABASE_URL is not set in the project Keys tab",
      };
    }

    try {
      await pool.query(ORDERS_DDL);

      if (orders.length > 0) {
        const upsert = `
          INSERT INTO ${ORDERS_TABLE}
            (id, customer_name, customer_phone, address, order_type, items,
             total, status, delivery_person_id, notes, created_at)
          SELECT * FROM unnest(
            $1::text[], $2::text[], $3::text[], $4::text[], $5::text[],
            $6::jsonb[], $7::numeric[], $8::text[], $9::text[], $10::text[],
            $11::bigint[]
          )
          ON CONFLICT (id) DO UPDATE SET
            customer_name = EXCLUDED.customer_name,
            customer_phone = EXCLUDED.customer_phone,
            address = EXCLUDED.address,
            order_type = EXCLUDED.order_type,
            items = EXCLUDED.items,
            total = EXCLUDED.total,
            status = EXCLUDED.status,
            delivery_person_id = EXCLUDED.delivery_person_id,
            notes = EXCLUDED.notes,
            created_at = EXCLUDED.created_at,
            synced_at = now()`;

        const rows = orders.map((o) => [
          o._id,
          o.customerName,
          o.customerPhone,
          o.address,
          o.orderType,
          JSON.stringify(o.items),
          o.total,
          o.status,
          o.deliveryPersonId ?? null,
          o.notes ?? "",
          o.createdAt,
        ]);

        await pool.query(upsert, [
          rows.map((r) => r[0]),
          rows.map((r) => r[1]),
          rows.map((r) => r[2]),
          rows.map((r) => r[3]),
          rows.map((r) => r[4]),
          rows.map((r) => r[5]),
          rows.map((r) => r[6]),
          rows.map((r) => r[7]),
          rows.map((r) => r[8]),
          rows.map((r) => r[9]),
          rows.map((r) => r[10]),
        ]);
      }

      return { synced: orders.length, total: orders.length, table: ORDERS_TABLE };
    } finally {
      await pool.end().catch(() => {});
    }
  },
});

/**
 * Admin-only: sync all Convex orders into the Supabase `orders` table.
 * Delegates to the internal action so the manual button and the automatic
 * schedule stay on the same code path.
 */
export const syncOrders = action({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    await requireAdmin(ctx);
    const result = await ctx.runAction(internal.supabase.syncOrdersDb);
    if (result.skipped) throw new Error(result.reason ?? "Sync skipped");
    return result;
  },
});

/* ----------------------------- CSV helpers ----------------------------- */

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote when the field contains a separator, quote or newline.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header, ...rows].map((r) =>
    r.map((cell) => csvCell(cell)).join(","),
  );
  // BOM so Excel opens UTF-8 correctly; \r\n for spreadsheet compatibility.
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

interface CsvRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  order_type: string;
  items: unknown;
  total: string;
  status: string;
  delivery_person_id: string | null;
  notes: string;
  created_at: string;
}

/** Formats order items like "2 × Zayka Special Burger; 1 × Loaded Fries". */
function formatItems(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((it) => {
      const line = it as { qty?: number; name?: string };
      return `${line.qty ?? 0} × ${line.name ?? ""}`;
    })
    .join("; ");
}

const CSV_HEADER = [
  "Order ID",
  "Placed At",
  "Customer",
  "Phone",
  "Type",
  "Items",
  "Total (₹)",
  "Status",
  "Delivery Person ID",
  "Address",
  "Notes",
];

/**
 * Admin-only: read the synced orders from Supabase and return them as CSV.
 * Run `syncOrders` first so the table contains the latest data.
 */
export const exportOrdersCsv = action({
  args: {},
  handler: async (ctx): Promise<ExportResult> => {
    await requireAdmin(ctx);

    const pool = buildPool();
    if (!pool) throw new Error("DATABASE_URL is not set in the project Keys tab");

    try {
      const result = await pool.query(
        `SELECT id, customer_name, customer_phone, address, order_type, items,
                total, status, delivery_person_id, notes, created_at
         FROM ${ORDERS_TABLE}
         ORDER BY created_at DESC`,
      );
      const dbRows = result.rows as unknown as CsvRow[];

      const rows = dbRows.map((r) => [
        r.id,
        new Date(Number(r.created_at)).toISOString(),
        r.customer_name,
        r.customer_phone,
        r.order_type,
        formatItems(r.items),
        r.total,
        r.status,
        r.delivery_person_id ?? "",
        r.address,
        r.notes,
      ]);

      const date = new Date().toISOString().slice(0, 10);
      return {
        csv: toCsv(CSV_HEADER, rows),
        count: rows.length,
        filename: `al-baik-zayka-orders-${date}.csv`,
      };
    } finally {
      await pool.end().catch(() => {});
    }
  },
});
