/**
 * Lightweight stats for the admin dashboard. Computed from the reactive
 * `orders` query so the numbers stay live as orders change.
 */

export interface OrderLine {
  /** Product id — used as a fallback to resolve the category for ranking. */
  productId?: string;
  /** Category frozen onto the line at order time (absent on legacy lines). */
  category?: string;
  name: string;
  qty: number;
  price: number;
}

/** Structural subset of Doc<"orders"> so the helpers stay unit-testable. */
export interface OrderLike {
  createdAt: number;
  status: string;
  total: number;
  items: OrderLine[];
}

/**
 * Maps an order line to a ranking group. Return `undefined` to fall back to
 * the line's own name (e.g. when a product's category can't be resolved).
 */
export type GroupKey = (line: OrderLine) => string | undefined;

export interface RankedGroup {
  name: string;
  qty: number;
  revenue: number;
}

export interface OrderStats {
  today: {
    /** Number of orders placed today (cancelled excluded). */
    count: number;
    /** Sum of totals for today's orders (cancelled excluded). */
    revenue: number;
    /** Total quantity of items sold today (cancelled excluded). */
    itemsSold: number;
  };
  /** Orders awaiting action (placed / confirmed) across all time. */
  pendingCount: number;
  /** Today's best-selling categories, sorted by quantity sold, max 5. */
  topCategories: RankedGroup[];
  /** Best-selling categories across all time (cancelled excluded), max 5. */
  topCategoriesAllTime: RankedGroup[];
}

const PENDING_STATUSES = new Set(["placed", "confirmed"]);

/** Local-midnight timestamp for "today". */
function startOfToday(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/** Aggregates order lines into ranked groups (by category or item name). */
function rankGroups(
  orders: OrderLike[],
  group?: GroupKey,
): { groups: RankedGroup[]; itemsSold: number } {
  let itemsSold = 0;
  const byKey = new Map<string, RankedGroup>();

  for (const order of orders) {
    for (const line of order.items) {
      itemsSold += line.qty;
      const key = group?.(line) ?? line.name;
      const prev = byKey.get(key) ?? { name: key, qty: 0, revenue: 0 };
      prev.qty += line.qty;
      prev.revenue += line.qty * line.price;
      byKey.set(key, prev);
    }
  }

  const groups = [...byKey.values()]
    .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
    .slice(0, 5);

  return { groups, itemsSold };
}

export function computeOrderStats(
  orders: OrderLike[],
  group?: GroupKey,
): OrderStats {
  const todayStart = startOfToday();
  const today = orders.filter(
    (o) => o.createdAt >= todayStart && o.status !== "cancelled",
  );
  const allTime = orders.filter((o) => o.status !== "cancelled");

  const revenue = today.reduce((sum, o) => sum + o.total, 0);
  const todayRank = rankGroups(today, group);
  const allTimeRank = rankGroups(allTime, group);

  return {
    today: {
      count: today.length,
      revenue,
      itemsSold: todayRank.itemsSold,
    },
    pendingCount: orders.filter((o) => PENDING_STATUSES.has(o.status)).length,
    topCategories: todayRank.groups,
    topCategoriesAllTime: allTimeRank.groups,
  };
}
