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
  orderType?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  rating?: number | null;
  review?: string | null;
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

/* ------------------------------------------------------------------ */
/* Analytics — richer analytics data for the admin dashboard           */
/* ------------------------------------------------------------------ */

export interface DailyRevenue {
  date: string;       // "Mon 14" label
  timestamp: number;  // start-of-day timestamp for sorting
  revenue: number;
  orders: number;
  itemsSold: number;
  avgOrderValue: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
  revenue: number;
}

export interface CustomerInsight {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: number;
}

export interface HourlyDistribution {
  hour: number;
  count: number;
}

export interface AnalyticsData {
  /** Last 7 days of revenue data (or fewer if history is short). */
  dailyRevenue: DailyRevenue[];
  /** All-time total revenue and order count. */
  allTime: { revenue: number; orders: number; avgOrderValue: number };
  /** Revenue & order count for today, this week, this month. */
  periods: {
    today: { revenue: number; orders: number };
    week: { revenue: number; orders: number };
    month: { revenue: number; orders: number };
  };
  /** Orders broken down by status. */
  statusBreakdown: StatusBreakdown[];
  /** Top customers by order count. */
  topCustomers: CustomerInsight[];
  /** Peak ordering hours (0–23). */
  hourlyDistribution: HourlyDistribution[];
  /** Delivery vs pickup split. */
  orderTypeSplit: { delivery: number; pickup: number };
  /** Customer satisfaction metrics. */
  satisfaction: { average: number; total: number; distribution: Record<number, number> };
}

/** Format a timestamp to a short day label like "Mon 14". */
function dayLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

/** Start-of-day timestamp (local midnight). */
function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export interface DateRange {
  /** Start-of-day timestamp (inclusive). */
  from: number;
  /** End-of-day timestamp (inclusive — extended to 23:59:59). */
  to: number;
}

/**
 * Computes analytics from all orders. When a `range` is provided, the
 * daily revenue chart, status breakdown, customers, hourly distribution,
 * order type split and satisfaction are scoped to that range. Period KPIs
 * (today / week / month) always reflect the full dataset.
 */
export function computeAnalytics(
  orders: OrderLike[],
  range?: { from: number; to: number },
): AnalyticsData {
  const allTime = orders.filter((o) => o.status !== "cancelled");
  const now = Date.now();
  const todayStart = startOfToday();
  const weekStart = startOfDay(now - 6 * 86_400_000);
  const monthStart = startOfDay(now - 29 * 86_400_000);

  // ---------- All-time totals ----------
  const allTimeRevenue = allTime.reduce((s, o) => s + o.total, 0);
  const allTimeAvg = allTime.length ? allTimeRevenue / allTime.length : 0;

  // ---------- Period totals ----------
  const todayOrders = allTime.filter((o) => o.createdAt >= todayStart);
  const weekOrders = allTime.filter((o) => o.createdAt >= weekStart);
  const monthOrders = allTime.filter((o) => o.createdAt >= monthStart);

  const periods = {
    today: {
      revenue: todayOrders.reduce((s, o) => o.total + s, 0),
      orders: todayOrders.length,
    },
    week: {
      revenue: weekOrders.reduce((s, o) => o.total + s, 0),
      orders: weekOrders.length,
    },
    month: {
      revenue: monthOrders.reduce((s, o) => o.total + s, 0),
      orders: monthOrders.length,
    },
  };

  // ---------- Scoped orders (within the selected date range) ----------
  const scoped = range
    ? allTime.filter((o) => o.createdAt >= range.from && o.createdAt <= range.to)
    : allTime;

  // ---------- Daily revenue (dynamic range) ----------
  const rangeFrom = range?.from ?? (now - 6 * 86_400_000);
  const rangeTo = range?.to ?? now;
  const rangeDays = Math.max(1, Math.round((startOfDay(rangeTo) - startOfDay(rangeFrom)) / 86_400_000) + 1);
  const dailyMap = new Map<number, { revenue: number; orders: number; itemsSold: number }>();
  for (let i = 0; i < rangeDays; i++) {
    const day = startOfDay(rangeFrom + i * 86_400_000);
    dailyMap.set(day, { revenue: 0, orders: 0, itemsSold: 0 });
  }
  for (const o of scoped) {
    const day = startOfDay(o.createdAt);
    const bucket = dailyMap.get(day);
    if (bucket) {
      bucket.revenue += o.total;
      bucket.orders += 1;
      bucket.itemsSold += o.items.reduce((s, l) => s + l.qty, 0);
    }
  }
  const dailyRevenue: DailyRevenue[] = [...dailyMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ts, data]) => ({
      date: dayLabel(ts),
      timestamp: ts,
      revenue: data.revenue,
      orders: data.orders,
      itemsSold: data.itemsSold,
      avgOrderValue: data.orders ? data.revenue / data.orders : 0,
    }));

  // ---------- Status breakdown (scoped) ----------
  const statusMap = new Map<string, { count: number; revenue: number }>();
  for (const o of scoped) {
    const prev = statusMap.get(o.status) ?? { count: 0, revenue: 0 };
    prev.count += 1;
    prev.revenue += o.total;
    statusMap.set(o.status, prev);
  }
  const statusBreakdown: StatusBreakdown[] = [...statusMap.entries()]
    .map(([status, data]) => ({ status, ...data }))
    .sort((a, b) => b.count - a.count);

  // ---------- Top customers (scoped) ----------
  const customerMap = new Map<string, CustomerInsight>();
  for (const o of scoped) {
    const key = o.customerPhone ?? o.customerName ?? "unknown";
    const prev = customerMap.get(key) ?? {
      name: o.customerName ?? "Unknown",
      phone: o.customerPhone ?? "",
      orderCount: 0,
      totalSpent: 0,
      lastOrder: 0,
    };
    prev.orderCount += 1;
    prev.totalSpent += o.total;
    prev.lastOrder = Math.max(prev.lastOrder, o.createdAt);
    customerMap.set(key, prev);
  }
  const topCustomers = [...customerMap.values()]
    .sort((a, b) => b.orderCount - a.orderCount || b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // ---------- Hourly distribution (scoped) ----------
  const hourCounts = new Array(24).fill(0) as number[];
  for (const o of scoped) {
    hourCounts[new Date(o.createdAt).getHours()] += 1;
  }
  const hourlyDistribution: HourlyDistribution[] = hourCounts.map((count, hour) => ({ hour, count }));

  // ---------- Order type split (scoped) ----------
  const orderTypeSplit = {
    delivery: scoped.filter((o) => o.orderType === "delivery").length,
    pickup: scoped.filter((o) => o.orderType === "pickup").length,
  };

  // ---------- Satisfaction / ratings (scoped) ----------
  const ratedOrders = scoped.filter((o) => o.rating !== undefined);
  const ratingSum = ratedOrders.reduce((s, o) => s + (o.rating ?? 0), 0);
  const avgRating = ratedOrders.length ? Math.round((ratingSum / ratedOrders.length) * 10) / 10 : 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const o of ratedOrders) {
    if (o.rating) distribution[o.rating] += 1;
  }
  const satisfaction = { average: avgRating, total: ratedOrders.length, distribution };

  return {
    dailyRevenue,
    allTime: { revenue: allTimeRevenue, orders: allTime.length, avgOrderValue: Math.round(allTimeAvg) },
    periods,
    statusBreakdown,
    topCustomers,
    hourlyDistribution,
    orderTypeSplit,
    satisfaction,
  };
}
