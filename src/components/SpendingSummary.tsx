import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarDays,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Order = Doc<"orders">;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function startOfMonth(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Custom tooltip                                                      */
/* ------------------------------------------------------------------ */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-0.5 text-xs font-bold text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-maroon">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SpendingSummary                                                     */
/* ------------------------------------------------------------------ */
export default function SpendingSummary() {
  const orders = useQuery(api.orders.myOrders);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    const delivered = orders.filter((o) => o.status !== "cancelled");
    const totalSpent = delivered.reduce((s, o) => s + o.total, 0);
    const avgOrder = delivered.length ? Math.round(totalSpent / delivered.length) : 0;

    // Member since (earliest order)
    const earliest = Math.min(...orders.map((o) => o.createdAt));

    // Favorite items (top 5 by quantity)
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of delivered) {
      for (const item of o.items) {
        const prev = itemMap.get(item.name) ?? { name: item.name, qty: 0, revenue: 0 };
        prev.qty += item.qty;
        prev.revenue += item.qty * item.price;
        itemMap.set(item.name, prev);
      }
    }
    const favoriteItems = [...itemMap.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Delivery vs pickup
    const deliveryCount = delivered.filter((o) => o.orderType === "delivery").length;
    const pickupCount = delivered.filter((o) => o.orderType === "pickup").length;

    // Monthly spending (last 6 months)
    const monthlyMap = new Map<string, { label: string; revenue: number; orders: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, {
        label: d.toLocaleDateString(undefined, { month: "short" }),
        revenue: 0,
        orders: 0,
      });
    }
    for (const o of delivered) {
      const key = monthKey(o.createdAt);
      const bucket = monthlyMap.get(key);
      if (bucket) {
        bucket.revenue += o.total;
        bucket.orders += 1;
      }
    }
    const monthlySpending = [...monthlyMap.values()].map((v) => ({
      name: v.label,
      revenue: v.revenue,
    }));

    // Active orders (not delivered/cancelled)
    const activeCount = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled",
    ).length;

    return {
      totalSpent,
      avgOrder,
      totalOrders: delivered.length,
      memberSince: earliest,
      favoriteItems,
      deliveryCount,
      pickupCount,
      monthlySpending,
      activeCount,
    };
  }, [orders]);

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  /* ---- Loading skeleton ---- */
  if (orders === undefined) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* ---- KPI row ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Total spent"
          value={`₹${stats.totalSpent.toLocaleString("en-IN")}`}
          tone="gold"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders placed"
          value={String(stats.totalOrders)}
          hint={stats.activeCount > 0 ? `${stats.activeCount} active` : undefined}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg order"
          value={`₹${stats.avgOrder}`}
        />
        <StatCard
          icon={CalendarDays}
          label="Member since"
          value={new Date(stats.memberSince).toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
          })}
        />
      </div>

      {/* ---- Monthly spending chart + Favorites ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly spending chart */}
        {stats.monthlySpending.some((m) => m.revenue > 0) && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide">
              <TrendingUp className="size-4 text-maroon" />
              Monthly spending
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.monthlySpending}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `₹${v}`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#65151b"
                  radius={[4, 4, 0, 0]}
                  name="Spent"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Favorite items */}
        {stats.favoriteItems.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide">
              <UtensilsCrossed className="size-4 text-maroon" />
              Your favorites
            </h3>
            <ol className="space-y-2">
              {stats.favoriteItems.map((item, i) => {
                const maxQty = stats.favoriteItems[0]?.qty ?? 1;
                return (
                  <li key={item.name}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-foreground">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-[10px] text-maroon">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">
                        {item.qty}×
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-maroon to-gold"
                        style={{ width: `${Math.round((item.qty / maxQty) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Delivery vs pickup */}
        {(stats.deliveryCount + stats.pickupCount) > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wide">
              <Truck className="size-4 text-maroon" />
              Delivery vs Pickup
            </h3>
            <div className="space-y-3">
              {/* Delivery bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-bold text-foreground/70">
                    {stats.deliveryCount} orders
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-maroon"
                    style={{
                      width: `${
                        stats.deliveryCount + stats.pickupCount
                          ? (stats.deliveryCount / (stats.deliveryCount + stats.pickupCount)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* Pickup bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-bold text-foreground/70">
                    {stats.pickupCount} orders
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{
                      width: `${
                        stats.deliveryCount + stats.pickupCount
                          ? (stats.pickupCount / (stats.deliveryCount + stats.pickupCount)) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "gold";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-4 text-maroon" />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-2xl tracking-wide",
          tone === "gold" ? "text-maroon" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
