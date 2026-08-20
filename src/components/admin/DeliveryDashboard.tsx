import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Phone, Truck, CheckCircle2, Clock, Package, Star, Navigation,
} from "lucide-react";
import { toast } from "sonner";

import type { Order, User } from "@/lib/db";
import { listAllOrders, listUsers } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderId, formatOrderTime, orderStatusLabels, type OrderStatus } from "@/data/orders";
import { friendlyErrorMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DeliveryPersonStats {
  user: User;
  active: Order[];
  completed: Order[];
  totalRevenue: number;
  avgRating: number;
  ratingCount: number;
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [o, u] = await Promise.all([listAllOrders(), listUsers()]);
      setOrders(o);
      setUsers(u);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const deliveryPeople = useMemo(
    () => users.filter((u) => u.role === "delivery"),
    [users],
  );

  const stats = useMemo<DeliveryPersonStats[]>(() => {
    return deliveryPeople.map((person) => {
      const active = orders.filter(
        (o) =>
          o.delivery_person_id === person.id &&
          !["delivered", "cancelled"].includes(o.status),
      );
      const completed = orders.filter(
        (o) =>
          o.delivery_person_id === person.id && o.status === "delivered",
      );
      const totalRevenue = completed.reduce((s, o) => s + o.total, 0);
      const rated = completed.filter((o) => o.rating != null);
      const avgRating = rated.length
        ? Math.round((rated.reduce((s, o) => s + (o.rating ?? 0), 0) / rated.length) * 10) / 10
        : 0;
      return {
        user: person,
        active,
        completed,
        totalRevenue,
        avgRating,
        ratingCount: rated.length,
      };
    });
  }, [deliveryPeople, orders]);

  // Unassigned active orders
  const unassigned = useMemo(
    () =>
      orders.filter(
        (o) =>
          !o.delivery_person_id &&
          !["delivered", "cancelled"].includes(o.status) &&
          o.order_type === "delivery",
      ),
    [orders],
  );

  const overallActive = useMemo(
    () =>
      orders.filter(
        (o) =>
          !["delivered", "cancelled"].includes(o.status) &&
          o.order_type === "delivery",
      ),
    [orders],
  );

  const overallDelivered = useMemo(
    () => orders.filter((o) => o.status === "delivered"),
    [orders],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Truck} label="Delivery staff" value={String(deliveryPeople.length)} tone="gold" />
        <Kpi icon={Package} label="Active deliveries" value={String(overallActive.length)} />
        <Kpi icon={CheckCircle2} label="Unassigned" value={String(unassigned.length)} hint={unassigned.length > 0 ? "needs attention" : "all covered"} />
        <Kpi icon={Star} label="Delivered" value={String(overallDelivered.length)} />
      </div>

      {/* Unassigned orders alert */}
      {unassigned.length > 0 && (
        <div className="rounded-2xl border border-amber-300/50 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <Clock className="size-4" />
            {unassigned.length} delivery order{unassigned.length !== 1 ? "s" : ""} waiting for assignment
          </p>
          <div className="mt-3 space-y-2">
            {unassigned.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3 text-sm">
                <div>
                  <span className="font-bold text-foreground">{formatOrderId(o.id)}</span>
                  <span className="ml-2 text-muted-foreground">{o.customer_name} — ₹{o.total}</span>
                </div>
                <OrderStatusBadge status={o.status as OrderStatus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery person cards */}
      <h3 className="flex items-center gap-2 font-display text-lg uppercase tracking-wide">
        <Truck className="size-5 text-maroon" /> Delivery team
      </h3>

      {stats.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No delivery staff yet. Assign the "delivery" role to users in the Staff tab.
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((s) => {
            const isExpanded = expandedId === s.user.id;
            return (
              <div key={s.user.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : s.user.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-lg uppercase text-maroon">
                    {(s.user.name ?? s.user.email ?? "?").charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {s.user.name ?? "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {s.active.length > 0 && (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        {s.active.length} active
                      </span>
                    )}
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                      {s.completed.length} delivered
                    </span>
                    {s.ratingCount > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        {s.avgRating}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-muted p-3 text-center">
                        <p className="text-2xl font-display text-maroon">{s.totalRevenue.toLocaleString("en-IN")}</p>
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Revenue (delivered)</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3 text-center">
                        <p className="text-2xl font-display text-foreground">{s.active.length}</p>
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Active now</p>
                      </div>
                      <div className="rounded-xl bg-muted p-3 text-center">
                        <p className="text-2xl font-display text-foreground">{s.completed.length}</p>
                        <p className="text-[11px] font-bold uppercase text-muted-foreground">Total delivered</p>
                      </div>
                    </div>

                    {/* Active orders */}
                    {s.active.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Active orders
                        </p>
                        <div className="space-y-2">
                          {s.active.map((o) => (
                            <OrderRow key={o.id} order={o} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent completed */}
                    {s.completed.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Recent deliveries
                        </p>
                        <div className="space-y-2">
                          {s.completed.slice(0, 5).map((o) => (
                            <OrderRow key={o.id} order={o} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
                        asChild
                      >
                        <a href={`tel:${s.user.email}`}>
                          <Phone className="size-3.5" /> Contact
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-4 text-maroon" />
        {label}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-2xl tracking-wide sm:text-3xl",
          tone === "gold" ? "text-maroon" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">{formatOrderId(order.id)}</span>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {order.customer_name} — {order.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-display text-lg text-maroon">₹{order.total}</span>
        {order.order_type === "delivery" && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 items-center justify-center rounded-full bg-maroon/10 text-maroon hover:bg-maroon/20"
          >
            <Navigation className="size-4" />
          </a>
        )}
      </div>
    </div>
  );
}
