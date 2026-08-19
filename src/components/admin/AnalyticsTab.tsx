import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import {
  CalendarDays, TrendingUp, Users, Clock, IndianRupee, ShoppingBag, Star, Truck, UtensilsCrossed,
} from "lucide-react";
import { useTheme } from "next-themes";

import type { Order } from "@/lib/db";
import { listAllOrders } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { computeAnalytics, type AnalyticsData } from "@/lib/order-stats";
import { orderStatusLabels, type OrderStatus } from "@/data/orders";
import { StarRating } from "@/components/StarRating";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  placed: "#f59e0b", confirmed: "#3b82f6", preparing: "#8b5cf6",
  out_for_delivery: "#06b6d4", delivered: "#22c55e", cancelled: "#ef4444",
};

function ChartTooltip({ active, payload, label, prefix = "" }: {
  active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string; prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-bold text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {prefix}{entry.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    listAllOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  const data: AnalyticsData | null = useMemo(() => {
    if (!orders) return null;
    const mapped = orders.map((o) => ({
      ...o,
      createdAt: new Date(o.created_at).getTime(),
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      orderType: o.order_type,
    }));
    return computeAnalytics(mapped);
  }, [orders]);

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-24" /><Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5"><Skeleton className="mb-4 h-5 w-36" /><Skeleton className="h-64 w-full" /></div>
          <div className="rounded-2xl border border-border bg-card p-5"><Skeleton className="mb-4 h-5 w-36" /><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  const hasOrders = data.allTime.orders > 0;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={IndianRupee} label="Today" value={`₹${data.periods.today.revenue.toLocaleString("en-IN")}`} sub={`${data.periods.today.orders} orders`} tone="gold" />
        <KpiCard icon={ShoppingBag} label="This week" value={`₹${data.periods.week.revenue.toLocaleString("en-IN")}`} sub={`${data.periods.week.orders} orders`} />
        <KpiCard icon={TrendingUp} label="This month" value={`₹${data.periods.month.revenue.toLocaleString("en-IN")}`} sub={`${data.periods.month.orders} orders`} />
        <KpiCard icon={IndianRupee} label="All time" value={`₹${data.allTime.revenue.toLocaleString("en-IN")}`} sub={`${data.allTime.orders} orders • avg ₹${data.allTime.avgOrderValue}`} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
            <TrendingUp className="size-5 text-maroon" /> Revenue trend
          </h3>
          {hasOrders ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.dailyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65151b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#65151b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip content={<ChartTooltip prefix="₹" />} />
                <Area type="monotone" dataKey="revenue" stroke="#65151b" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No orders yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
            <ShoppingBag className="size-5 text-maroon" /> Order status
          </h3>
          {data.statusBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {data.statusBreakdown.map((entry) => (<Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />))}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-xs font-bold text-muted-foreground">{orderStatusLabels[payload[0].payload.status as OrderStatus] ?? payload[0].payload.status}</p>
                      <p className="text-sm font-semibold">{payload[0].value} orders</p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.statusBreakdown.map((entry) => (
                  <span key={entry.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-block size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#94a3b8" }} />
                    {orderStatusLabels[entry.status as OrderStatus] ?? entry.status}
                    <span className="font-bold text-foreground/70">{entry.count}</span>
                  </span>
                ))}
              </div>
            </>
          ) : <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data</div>}
        </div>
      </div>

      {/* Peak hours */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
          <Clock className="size-5 text-maroon" /> Peak ordering hours
        </h3>
        {hasOrders ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="hour" tickFormatter={(h: number) => `${h}:00`} tick={{ fill: textColor, fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: textColor, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => active && payload?.[0] ? (
                <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs font-bold text-muted-foreground">{label}:00 – {Number(label) + 1}:00</p>
                  <p className="text-sm font-semibold">{payload[0].value} orders</p>
                </div>
              ) : null} />
              <Bar dataKey="count" fill="#65151b" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data</div>}
      </div>

      {/* Top customers + Delivery vs Pickup */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
            <Users className="size-5 text-maroon" /> Top customers
          </h3>
          {data.topCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Phone</th>
                    <th className="pb-2 pr-4 text-right">Orders</th>
                    <th className="pb-2 text-right">Total spent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCustomers.map((c, i) => (
                    <tr key={c.phone} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4"><span className="flex size-6 items-center justify-center rounded-full bg-maroon/10 font-display text-xs text-maroon">{i + 1}</span></td>
                      <td className="py-2.5 pr-4 font-medium text-foreground">{c.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{c.phone}</td>
                      <td className="py-2.5 pr-4 text-right font-bold text-foreground/70">{c.orderCount}</td>
                      <td className="py-2.5 text-right font-bold text-maroon">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">No customer data yet</div>}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
            <Truck className="size-5 text-maroon" /> Order type
          </h3>
          {(data.orderTypeSplit.delivery + data.orderTypeSplit.pickup) > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={[{ name: "Delivery", value: data.orderTypeSplit.delivery }, { name: "Pickup", value: data.orderTypeSplit.pickup }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                    <Cell fill="#65151b" /><Cell fill="#c8a94e" />
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.[0] ? (
                    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-xs font-bold text-muted-foreground">{payload[0].name}</p>
                      <p className="text-sm font-semibold">{payload[0].value} orders</p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="inline-block size-2 rounded-full bg-[#65151b]" /> Delivery ({data.orderTypeSplit.delivery})</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="inline-block size-2 rounded-full bg-[#c8a94e]" /> Pickup ({data.orderTypeSplit.pickup})</span>
              </div>
            </>
          ) : <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No data</div>}

          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <MiniStat icon={UtensilsCrossed} label="Avg order value" value={`₹${data.allTime.avgOrderValue}`} />
            <MiniStat icon={ShoppingBag} label="Items sold" value={String(data.dailyRevenue.reduce((s, d) => s + d.itemsSold, 0))} />
          </div>
        </div>
      </div>

      {/* Satisfaction */}
      {data.satisfaction.total > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg uppercase tracking-wide">
            <Star className="size-5 text-maroon fill-gold" /> Customer satisfaction
            <span className="ml-auto text-xs font-normal normal-case text-muted-foreground">{data.satisfaction.total} review{data.satisfaction.total !== 1 ? "s" : ""}</span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center gap-1">
              <p className="font-display text-5xl text-maroon">{data.satisfaction.average}</p>
              <StarRating value={Math.round(data.satisfaction.average)} readonly size="md" />
              <p className="text-[11px] text-muted-foreground">out of 5</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.satisfaction.distribution[star] ?? 0;
                const pct = data.satisfaction.total ? (count / data.satisfaction.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-3 text-right text-xs font-bold text-foreground/70">{star}</span>
                    <Star className="size-3.5 fill-gold text-gold" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs font-bold text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone = "default" }: {
  icon: React.ElementType; label: string; value: string; sub: string; tone?: "default" | "gold";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-4 text-maroon" />{label}
      </div>
      <p className={cn("mt-2 font-display text-2xl tracking-wide sm:text-3xl", tone === "gold" ? "text-maroon" : "text-foreground")}>{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5 text-maroon" />{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
