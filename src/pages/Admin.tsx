import React, { useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  Flame,
  IndianRupee,
  LayoutDashboard,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  SearchX,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { DbStatusResult } from "@/convex/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PanelHeader } from "@/components/orders/PanelHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import {
  ORDER_STATUSES,
  formatOrderId,
  formatOrderTime,
  orderStatusLabels,
  type OrderStatus,
} from "@/data/orders";
import { computeOrderStats } from "@/lib/order-stats";
import { cn, friendlyErrorMessage } from "@/lib/utils";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import { StarRating } from "@/components/StarRating";

type Product = Doc<"products">;
type Order = Doc<"orders">;
type User = Doc<"users">;

const fallbackImage =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop";

function PanelLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-maroon" />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Bootstrap — the very first user claims the admin role                */
/* ------------------------------------------------------------------ */
function AdminBootstrap() {
  const bootstrap = useMutation(api.roles.bootstrapAdmin);
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    setBusy(true);
    try {
      await bootstrap();
      toast("You are now the admin!");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not claim admin"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6">
        <span className="flex size-16 items-center justify-center rounded-full bg-maroon/10 text-maroon">
          <ShieldCheck className="size-8" />
        </span>
        <h1 className="mt-6 font-display text-4xl uppercase tracking-wide">
          Set up the{" "}
          <span className="font-script font-bold normal-case text-maroon">
            admin
          </span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          No admin exists yet. This first account can claim the admin role to
          manage the menu, prices, orders and delivery staff.
        </p>
        <Button
          size="lg"
          className="mt-8 h-12 bg-gold px-8 text-base font-bold text-[#3a2403] hover:bg-gold-bright"
          onClick={claim}
          disabled={busy}
        >
          {busy ? "Claiming…" : "Make me the admin"}
        </Button>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Orders tab                                                          */
/* ------------------------------------------------------------------ */
function OrdersTab() {
  const orders = useQuery(api.orders.adminList);
  const users = useQuery(api.roles.listUsers);
  const setStatus = useMutation(api.orders.setStatus);
  const assignDelivery = useMutation(api.orders.assignDelivery);

  const deliveryPeople = useMemo(
    () => (users ?? []).filter((u) => u.role === "delivery"),
    [users],
  );

  // Hooks must be unconditional, so compute stats from the loaded orders
  // (or an empty list while loading) — never after an early return.
  const stats = useMemo(
    () => computeOrderStats(orders ?? [], (line) => line.category),
    [orders],
  );
  const [topItemsRange, setTopItemsRange] = useState<"today" | "all">("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  if (orders === undefined || users === undefined) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-28" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Skeleton className="mb-2 h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <Skeleton className="mb-2 h-3 w-48" />
                <Skeleton className="mb-1 h-3 w-36" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div>
                <Skeleton className="mb-2 h-3 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      formatOrderId(order._id).toLowerCase().includes(q) ||
      order.items.some((it) => it.name.toLowerCase().includes(q));
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const topCategories =
    topItemsRange === "all" ? stats.topCategoriesAllTime : stats.topCategories;

  return (
    <div className="space-y-4">
      {/* Live numbers for today */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Today's revenue"
          value={`₹${stats.today.revenue.toLocaleString("en-IN")}`}
          tone="gold"
        />
        <StatCard
          icon={Receipt}
          label="Orders today"
          value={String(stats.today.count)}
          hint={`${orders.length} all-time`}
        />
        <StatCard
          icon={ShoppingBag}
          label="Items sold today"
          value={String(stats.today.itemsSold)}
        />
        <StatCard
          icon={Clock}
          label="Awaiting action"
          value={String(stats.pendingCount)}
          hint="placed or confirmed"
        />
      </div>

      {/* Best sellers */}
      {topCategories.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-display text-lg uppercase tracking-wide">
              <Flame className="size-5 text-maroon" />
              Top categories
            </h3>
            <div className="flex items-center gap-3">
              <span className="hidden text-[11px] text-muted-foreground sm:inline">
                by quantity • excludes cancelled
              </span>
              <div className="flex gap-1 rounded-full border border-border bg-muted p-1">
                {(["today", "all"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTopItemsRange(range)}
                    className={cn(
                      "cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors",
                      topItemsRange === range
                        ? "bg-gold text-[#3a2403]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {range === "today" ? "Today" : "All time"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ol className="mt-4 space-y-3">
            {topCategories.map((group, i) => {
              const maxQty = topCategories[0]?.qty ?? 1;
              return (
                <li key={group.name}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2.5 text-foreground">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-xs text-maroon">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium">{group.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs">
                      <span className="rounded-full border border-maroon/30 bg-maroon/10 px-2 py-0.5 font-bold text-maroon">
                        {group.qty} sold
                      </span>
                      <span className="w-16 text-right font-semibold text-foreground/70">
                        ₹{group.revenue.toLocaleString("en-IN")}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-maroon to-gold"
                      style={{
                        width: `${Math.round((group.qty / maxQty) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Search & filter */}
      {orders.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by name, phone, order ID, or item…"
              className="h-10 rounded-full border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
              aria-label="Search orders"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["all", ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setOrderStatusFilter(s)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors",
                  orderStatusFilter === s
                    ? "border-gold bg-gold text-[#3a2403]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "All" : orderStatusLabels[s as OrderStatus]}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && orders.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <SearchX className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            No orders match your search. Try a different keyword or clear the filter.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No orders yet. Orders placed on the website appear here.
        </div>
      ) : (
        filteredOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            deliveryPeople={deliveryPeople}
            onStatus={(status) => {
              setStatus({ orderId: order._id, status });
              toast(`Order ${formatOrderId(order._id)} → ${orderStatusLabels[status]}`);
            }}
            onAssign={(id) => {
              assignDelivery({ orderId: order._id, deliveryPersonId: id });
              toast("Delivery person updated");
            }}
          />
        ))
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
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

function OrderCard({
  order,
  deliveryPeople,
  onStatus,
  onAssign,
}: {
  order: Order;
  deliveryPeople: User[];
  onStatus: (status: (typeof ORDER_STATUSES)[number]) => void;
  onAssign: (id: Id<"users"> | null) => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg uppercase tracking-wide">
            {formatOrderId(order._id)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatOrderTime(order.createdAt)} •{" "}
            {order.orderType === "delivery" ? "Delivery" : "Pickup"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Customer + items */}
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">{order.customerName}</p>
          <a
            href={`tel:${order.customerPhone}`}
            className="flex w-fit items-center gap-1.5 text-maroon hover:text-maroon/70"
          >
            <Phone className="size-3.5" />
            {order.customerPhone}
          </a>
          {order.orderType === "delivery" && (
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-maroon" />
              {order.address}
            </p>
          )}
          {order.notes && (
            <p className="text-muted-foreground">Note: {order.notes}</p>
          )}
          {order.rating !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StarRating value={order.rating} readonly size="sm" />
                <span className="text-xs font-bold text-maroon">{order.rating}/5</span>
              </div>
              {order.review && (
                <p className="text-xs italic text-muted-foreground">&ldquo;{order.review}&rdquo;</p>
              )}
            </div>
          )}
          <ul className="space-y-0.5 border-t border-border pt-2 text-foreground/70">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {it.qty} × {it.name}
                </span>
                <span className="shrink-0">₹{it.price * it.qty}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 border-t border-border pt-1.5 font-bold text-maroon">
              <span>Total</span>
              <span>₹{order.total}</span>
            </li>
          </ul>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Status
            </Label>
            <Select value={order.status} onValueChange={(v) => onStatus(v as (typeof ORDER_STATUSES)[number])}>
              <SelectTrigger className="h-10 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {orderStatusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Delivery person
            </Label>
            <Select
              value={order.deliveryPersonId ?? "none"}
              onValueChange={(v) => onAssign(v === "none" ? null : (v as Id<"users">))}
            >
              <SelectTrigger className="h-10 border-border bg-background text-foreground">
                <SelectValue placeholder="Assign a delivery person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not assigned</SelectItem>
                {deliveryPeople.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.name ?? u.email ?? "Delivery person"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Products tab                                                        */
/* ------------------------------------------------------------------ */
interface ProductFormState {
  name: string;
  category: string;
  description: string;
  price: string;
  image: string;
  isAvailable: boolean;
  isPopular: boolean;
  isOffer: boolean;
  veg: "veg" | "nonveg" | "unknown";
}

const emptyForm: ProductFormState = {
  name: "",
  category: "",
  description: "",
  price: "",
  image: "",
  isAvailable: true,
  isPopular: false,
  isOffer: false,
  veg: "unknown",
};

function formFromProduct(p: Product): ProductFormState {
  return {
    name: p.name,
    category: p.category,
    description: p.description,
    price: String(p.price),
    image: p.image,
    isAvailable: p.isAvailable,
    isPopular: p.isPopular ?? false,
    isOffer: p.isOffer ?? false,
    veg: p.veg === undefined ? "unknown" : p.veg ? "veg" : "nonveg",
  };
}

function ProductsTab() {
  const products = useQuery(api.products.list);
  const create = useMutation(api.products.create);
  const update = useMutation(api.products.update);
  const remove = useMutation(api.products.remove);
  const ensureSeeded = useMutation(api.products.ensureSeeded);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [removing, setRemoving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(formFromProduct(p));
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const price = Number(form.price);
      if (!form.name.trim() || !form.category.trim() || !Number.isFinite(price) || price < 0) {
        toast("Name, category and a valid price are required");
        return;
      }
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        image: form.image.trim() || fallbackImage,
        isAvailable: form.isAvailable,
        isPopular: form.isPopular,
        isOffer: form.isOffer,
        veg: form.veg === "unknown" ? undefined : form.veg === "veg",
      };
      if (editing) {
        await update({ id: editing._id, ...payload });
        toast("Product updated");
      } else {
        await create(payload);
        toast("Product added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await remove({ id: deleting._id });
      toast("Product removed");
      setDeleting(null);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not remove product"));
    } finally {
      setRemoving(false);
    }
  };

  const importStarter = async () => {
    try {
      const res = await ensureSeeded();
      toast(res.seeded ? "Starter menu imported" : "Menu already exists");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not import menu"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {products === undefined
            ? "Loading…"
            : `${products.length} item${products.length === 1 ? "" : "s"} on the menu`}
        </p>
        <div className="flex flex-wrap gap-2">
          {products !== undefined && products.length === 0 && (
            <Button
              variant="outline"
              onClick={importStarter}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <UtensilsCrossed className="size-4" />
              Import starter menu
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add product
          </Button>
        </div>
      </div>

      {products === undefined ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-1 h-3 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Package className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            No products yet. Import the starter menu or add your first product.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article
              key={p._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
                <span
                  className={cn(
                    "absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                    p.isAvailable
                      ? "border-green-500/50 bg-green-100 text-green-800"
                      : "border-red-500/50 bg-red-100 text-red-800",
                  )}
                >
                  {p.isAvailable ? "Available" : "Sold out"}
                </span>
                <span className="absolute bottom-3 left-3 font-display text-2xl text-gold-bright">
                  ₹{p.price}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg uppercase leading-tight tracking-wide">
                    {p.name}
                  </h3>
                  <span className="flex shrink-0 gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-8 border-border text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.category}</p>
                <p className="mt-1.5 line-clamp-2 text-sm text-foreground/70">
                  {p.description}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider">
                  {p.veg === true && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                      <Leaf className="size-3" /> Veg
                    </span>
                  )}
                  {p.veg === false && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-800">
                      <BadgeCheck className="size-3" /> Non-veg
                    </span>
                  )}
                  {p.isPopular && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Popular</span>
                  )}
                  {p.isOffer && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">Combo</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Changes go live on the website menu instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Zayka Special Burger"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Burgers"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="129"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What makes this dish special…"
                rows={2}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Type</Label>
              <Select
                value={form.veg}
                onValueChange={(v) => setForm({ ...form, veg: v as ProductFormState["veg"] })}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-vegetarian</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Availability</Label>
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Popular</Label>
              <Switch
                checked={form.isPopular}
                onCheckedChange={(v) => setForm({ ...form, isPopular: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Combo / Offer</Label>
              <Switch
                checked={form.isOffer}
                onCheckedChange={(v) => setForm({ ...form, isOffer: v })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">
              Remove product?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              “{deleting?.name}” will disappear from the website menu. Past
              orders keep their own copy of the item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={removing}
            >
              {removing ? "Removing…" : "Remove product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Delivery staff tab                                                  */
/* ------------------------------------------------------------------ */
function StaffTab() {
  const users = useQuery(api.roles.listUsers);
  const setRole = useMutation(api.roles.setRole);

  if (users === undefined) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading users…</p>;
  }

  const changeRole = async (userId: Id<"users">, role: string) => {
    try {
      await setRole({
        userId,
        role: (role === "none" ? null : role) as "user" | "delivery" | "admin" | null,
      });
      toast("Role updated");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not update role"));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Make users delivery persons so you can assign orders to them. The
        delivery person sees assigned orders in their Delivery dashboard.
      </p>
      {users.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No users yet.
        </p>
      ) : (
        users.map((u) => (
          <div
            key={u._id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-base uppercase text-maroon">
                {(u.name ?? u.email ?? "?").slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {u.name ?? "No name"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.email ?? "No email"}
                </p>
                <span className="mt-1 inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {u.role ?? "user"}
                </span>
              </div>
            </div>
            <div className="sm:w-48">
              <Select
                value={u.role ?? "user"}
                onValueChange={(v) => changeRole(u._id, v)}
              >
                <SelectTrigger className="h-10 border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="delivery">Delivery person</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="none">No role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Database tab                                                        */
/* ------------------------------------------------------------------ */
function DatabaseTab() {
  const check = useAction(api.supabase.status);
  const syncOrders = useAction(api.supabase.syncOrders);
  const exportCsv = useAction(api.supabase.exportOrdersCsv);
  const [result, setResult] = useState<DbStatusResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    try {
      setResult(await check());
    } catch (err) {
      setResult({
        connected: false,
        error: friendlyErrorMessage(err, "Could not reach the action"),
        database: null,
        version: null,
        tables: [],
      });
    } finally {
      setBusy(false);
    }
  };

  const doSync = async () => {
    setSyncing(true);
    try {
      const res = await syncOrders();
      setLastSync(
        `${res.synced} order${res.synced === 1 ? "" : "s"} synced into the Supabase \`${res.table}\` table`,
      );
      toast(`Synced ${res.synced} orders to Supabase`);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not sync orders"));
    } finally {
      setSyncing(false);
    }
  };

  const doExport = async () => {
    setExporting(true);
    try {
      const res = await exportCsv();
      if (res.count === 0) {
        toast("No orders in Supabase yet — sync the orders first");
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast(`Exported ${res.count} orders as CSV`);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not export orders"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
            <Database className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-lg uppercase tracking-wide">
              Supabase Postgres
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              External database connected from Convex node actions. The
              connection string lives in the project Keys tab as{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-maroon">
                DATABASE_URL
              </code>
              . Use the pooler host — the direct{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                db.&lt;ref&gt;.supabase.co
              </code>{" "}
              host is IPv6-only:
              <code className="mt-1 block break-all rounded bg-muted px-2 py-1 text-[11px] text-maroon">
                postgresql://postgres.&lt;project-ref&gt;:&lt;password&gt;@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
              </code>
            </p>
          </div>
        </div>
        <Button
          onClick={run}
          disabled={busy}
          className="mt-4"
        >
          <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
          {result ? "Test again" : "Test connection"}
        </Button>
      </div>

      {/* Order history export via Supabase */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
            <FileSpreadsheet className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-lg uppercase tracking-wide">
              Order history export
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Orders are auto-synced into the Supabase{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-maroon">
                orders
              </code>{" "}
              table whenever one is placed or its status/assignment changes.
              Use <span className="font-semibold text-foreground/80">Sync orders</span>{" "}
              for a manual refresh, then download the history as a CSV for
              Excel or Google Sheets.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={doSync} disabled={syncing}>
            <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} />
            {syncing ? "Syncing…" : "Sync orders"}
          </Button>
          <Button
            variant="outline"
            onClick={doExport}
            disabled={exporting}
            className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <Download className="size-4" />
            {exporting ? "Preparing…" : "Download CSV"}
          </Button>
        </div>
        {lastSync && (
          <p className="mt-3 text-xs font-medium text-green-700">{lastSync}</p>
        )}
      </div>

      {result &&
        (result.connected ? (
          <div className="rounded-2xl border border-green-500/40 bg-green-50 p-5">
            <p className="flex items-center gap-2 font-bold text-green-700">
              <CheckCircle2 className="size-5" />
              Connected to {result.database ?? "postgres"}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-green-700/80">
              {result.version}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-green-700">
              Tables in public schema
            </p>
            {result.tables.length === 0 ? (
              <p className="mt-1 text-xs text-green-700/70">
                No tables yet — ready for the first one.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.tables.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-green-500/40 bg-green-100 px-2.5 py-1 text-xs text-green-800"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/40 bg-red-50 p-5">
            <p className="flex items-center gap-2 font-bold text-red-700">
              <XCircle className="size-5" />
              Not connected
            </p>
            <p className="mt-2 break-words text-xs leading-relaxed text-red-700/80">
              {result.error}
            </p>
          </div>
        ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin panel                                                         */
/* ------------------------------------------------------------------ */
const tabs = [
  { id: "orders", label: "Orders", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "staff", label: "Delivery Staff", icon: Users },
  { id: "database", label: "Database", icon: Database },
] as const;

type TabId = (typeof tabs)[number]["id"];

function AdminPanel() {
  const [tab, setTab] = useState<TabId>("orders");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelHeader
        right={
          <Button
            variant="ghost"
            asChild
            className="hidden text-muted-foreground hover:bg-muted hover:text-maroon sm:inline-flex"
          >
            <Link to="/">
              <UtensilsCrossed className="size-4" />
              View site
            </Link>
          </Button>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-maroon">
          Admin panel
        </p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          Full{" "}
          <span className="font-script font-bold normal-case text-maroon">
            control
          </span>
        </h1>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "border-gold bg-gold text-[#3a2403]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "orders" && <OrdersTab />}
          {tab === "analytics" && (
            <React.Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-maroon" />
                </div>
              }
            >
              <AnalyticsTab />
            </React.Suspense>
          )}
          {tab === "products" && <ProductsTab />}
          {tab === "staff" && <StaffTab />}
          {tab === "database" && <DatabaseTab />}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gate                                                                */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const status = useQuery(api.roles.roleStatus);
  const location = useLocation();

  if (isLoading || status === undefined) return <PanelLoading />;

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />
    );
  }

  if (status.isAdmin) return <AdminPanel />;
  if (!status.adminExists) return <AdminBootstrap />;
  return <Navigate to="/dashboard" replace />;
}
