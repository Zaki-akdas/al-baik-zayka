import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
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
  Tag,
  Trash2,
  Users,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import type { Order, Product, User } from "@/lib/db";
import {
  listAllOrders,
  listProducts,
  listUsers,
  updateOrderStatus,
  assignDelivery,
  createProduct,
  updateProduct,
  deleteProduct,
  setUserRole,
  getRoleStatus,
  checkSupabaseConnection,
} from "@/lib/db";
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
import OffersTab from "@/components/admin/OffersTab";
import { StarRating } from "@/components/StarRating";
import { OrderItemClickable } from "@/components/OrderItemDialog";
import { menuItems } from "@/data/menu";

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
/* Bootstrap page                                                      */
/* ------------------------------------------------------------------ */
function AdminBootstrap() {
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    setBusy(true);
    try {
      const { ensureUserProfile } = await import("@/lib/db");
      const profile = await ensureUserProfile();
      if (profile) {
        await setUserRole(profile.id, "admin");
      }
      toast("You are now the admin!");
      window.location.reload();
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
/* StatCard                                                             */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Orders tab                                                           */
/* ------------------------------------------------------------------ */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    try {
      const [o, u] = await Promise.all([listAllOrders(), listUsers()]);
      setOrders(o);
      setUsers(u);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load orders"));
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

  const stats = useMemo(
    () => computeOrderStats(orders.map((o) => ({ ...o, createdAt: new Date(o.created_at).getTime() }))),
    [orders],
  );

  const filteredOrders = orders.filter((order) => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.customer_name.toLowerCase().includes(q) ||
      order.customer_phone.includes(q) ||
      order.id.slice(-6).toLowerCase().includes(q) ||
      order.items.some((it) => it.name.toLowerCase().includes(q));
    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-3 sm:p-4">
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
          </div>
        ))}
      </div>
    );
  }

  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus,
  ) => {
    try {
      await updateOrderStatus(orderId, status);
      toast(`Order updated → ${orderStatusLabels[status]}`);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not update order"));
    }
  };

  const handleAssign = async (orderId: string, personId: string | null) => {
    try {
      await assignDelivery(orderId, personId);
      toast("Delivery person updated");
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not assign delivery"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Today's revenue" value={`₹${stats.today.revenue.toLocaleString("en-IN")}`} tone="gold" />
        <StatCard icon={Receipt} label="Orders today" value={String(stats.today.count)} hint={`${orders.length} all-time`} />
        <StatCard icon={ShoppingBag} label="Items sold today" value={String(stats.today.itemsSold)} />
        <StatCard icon={Clock} label="Awaiting action" value={String(stats.pendingCount)} hint="placed or confirmed" />
      </div>

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

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <SearchX className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            {orders.length === 0
              ? "No orders yet."
              : "No orders match your search."}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border bg-card p-3 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-display text-lg uppercase tracking-wide">
                  {formatOrderId(order.id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatOrderTime(new Date(order.created_at).getTime())} •{" "}
                  {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                </p>
              </div>
              <OrderStatusBadge status={order.status as OrderStatus} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-foreground">{order.customer_name}</p>
                <a href={`tel:${order.customer_phone}`} className="flex w-fit items-center gap-1.5 text-maroon hover:text-maroon/70">
                  <Phone className="size-3.5" />
                  {order.customer_phone}
                </a>
                {order.order_type === "delivery" && (
                  <p className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-maroon" />
                    {order.address}
                  </p>
                )}
                {order.rating !== undefined && order.rating !== null && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StarRating value={order.rating} readonly size="sm" />
                      <span className="text-xs font-bold text-maroon">{order.rating}/5</span>
                    </div>
                    {order.review && <p className="text-xs italic text-muted-foreground">&ldquo;{order.review}&rdquo;</p>}
                  </div>
                )}
                <div className="space-y-0.5 border-t border-border pt-2">
                  {order.items.map((it, i) => (
                    <OrderItemClickable
                      key={i}
                      name={it.name}
                      price={it.price}
                      qty={it.qty}
                      category={it.category}
                    />
                  ))}
                  <li className="flex justify-between gap-3 border-t border-border pt-1.5 font-bold text-maroon">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </li>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                    <SelectTrigger className="h-10 border-border bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{orderStatusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Delivery person</Label>
                  <Select
                    value={order.delivery_person_id ?? "none"}
                    onValueChange={(v) => handleAssign(order.id, v === "none" ? null : v)}
                  >
                    <SelectTrigger className="h-10 border-border bg-background text-foreground">
                      <SelectValue placeholder="Assign a delivery person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not assigned</SelectItem>
                      {deliveryPeople.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name ?? u.email ?? "Delivery person"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Products tab                                                         */
/* ------------------------------------------------------------------ */
interface ProductFormState {
  name: string;
  category: string;
  description: string;
  price: string;
  priceHalf: string;
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
  priceHalf: "",
  image: "",
  isAvailable: true,
  isPopular: false,
  isOffer: false,
  veg: "unknown",
};

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [removing, setRemoving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setProducts(await listProducts());
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      price: String(p.price),
      priceHalf: p.price_half != null ? String(p.price_half) : "",
      image: p.image,
      isAvailable: p.is_available,
      isPopular: p.is_popular,
      isOffer: p.is_offer,
      veg: p.veg === undefined ? "unknown" : p.veg ? "veg" : "nonveg",
    });
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
      const priceHalf = form.priceHalf.trim() ? Number(form.priceHalf) : null;
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        price_half: priceHalf,
        image: form.image.trim() || fallbackImage,
        is_available: form.isAvailable,
        is_popular: form.isPopular,
        is_offer: form.isOffer,
        veg: form.veg === "unknown" ? null : form.veg === "veg",
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast("Product updated");
      } else {
        await createProduct(payload);
        toast("Product added");
      }
      setDialogOpen(false);
      refresh();
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
      await deleteProduct(deleting.id);
      toast("Product removed");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not remove product"));
    } finally {
      setRemoving(false);
    }
  };

  const importStarter = async () => {
    try {
      const { createProduct: cp } = await import("@/lib/db");
      const menuData = await import("@/data/menu");
      const SEED_PRICES: Record<string, number> = {
        "zayka-special-burger": 129, "classic-chicken-burger": 99, "cheese-loaded-burger": 119,
        "spicy-tandoori-burger": 119, "chicken-shawarma": 89, "zayka-special-wrap": 109,
        "double-chicken-wrap": 119, "margherita-pizza": 149, "zayka-special-pizza": 199,
        "spicy-chicken-pizza": 179, "loaded-fries": 99, "peri-peri-fries": 79,
        "cheesy-garlic-bread": 99, "zayka-combo": 249, "family-combo": 549,
        "shawarma-combo": 199, "cold-drinks": 40, "milkshakes": 79,
        "fresh-lime-soda": 39, "todays-special": 199, "zayka-special-plate": 249,
      };
      for (const item of menuData.menuItems ?? []) {
        await cp({
          name: item.name,
          category: item.category,
          description: item.description ?? "",
          price: SEED_PRICES[item.id] ?? 99,
          price_half: item.priceHalf ?? null,
          image: item.image,
          is_available: item.isAvailable ?? true,
          is_popular: item.isPopular ?? false,
          is_offer: item.isOffer ?? false,
          veg: item.veg,
        });
      }
      toast("Starter menu imported");
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not import menu"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${products.length} item${products.length === 1 ? "" : "s"} on the menu`}
        </p>
        <div className="flex flex-wrap gap-2">
          {products.length === 0 && !loading && (
            <Button variant="outline" onClick={importStarter} className="border-border text-foreground/80 hover:bg-muted hover:text-foreground">
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <Skeleton className="aspect-[16/9] w-full" />
              <div className="p-4"><Skeleton className="mb-2 h-5 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Package className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">No products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
                <span className={cn("absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", p.is_available ? "border-green-500/50 bg-green-100 text-green-800" : "border-red-500/50 bg-red-100 text-red-800")}>
                  {p.is_available ? "Available" : "Sold out"}
                </span>
                <span className="absolute bottom-3 left-3 font-display text-2xl text-gold-bright">₹{p.price}</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg uppercase leading-tight tracking-wide">{p.name}</h3>
                  <span className="flex shrink-0 gap-1.5">
                    <Button variant="outline" size="icon-sm" className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="icon-sm" className="size-8 border-border text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.category}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider">
                  {p.veg === true && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800"><Leaf className="size-3" /> Veg</span>}
                  {p.veg === false && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-800"><BadgeCheck className="size-3" /> Non-veg</span>}
                  {p.is_popular && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Popular</span>}
                  {p.is_offer && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">Combo</span>}
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
            <DialogDescription className="text-muted-foreground">Changes go live on the website menu instantly.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Zayka Special Burger" className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Burgers" className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Price (₹)</Label>
              <Input type="number" min={0} step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="129" className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes this dish special…" rows={2} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Type</Label>
              <Select value={form.veg} onValueChange={(v) => setForm({ ...form, veg: v as ProductFormState["veg"] })}>
                <SelectTrigger className="border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-vegetarian</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Availability</Label>
              <Switch checked={form.isAvailable} onCheckedChange={(v) => setForm({ ...form, isAvailable: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Popular</Label>
              <Switch checked={form.isPopular} onCheckedChange={(v) => setForm({ ...form, isPopular: v })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Combo / Offer</Label>
              <Switch checked={form.isOffer} onCheckedChange={(v) => setForm({ ...form, isOffer: v })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground/80 hover:bg-muted hover:text-foreground">Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">Remove product?</DialogTitle>
            <DialogDescription className="text-muted-foreground">&ldquo;{deleting?.name}&rdquo; will disappear from the website menu.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)} className="border-border text-foreground/80 hover:bg-muted hover:text-foreground">Keep it</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={removing}>{removing ? "Removing…" : "Remove product"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Staff tab                                                            */
/* ------------------------------------------------------------------ */
function StaffTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const changeRole = async (userId: string, role: string) => {
    try {
      await setUserRole(userId, role === "none" ? null : role as User["role"]);
      toast("Role updated");
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not update role"));
    }
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground">Loading users…</p>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Make users delivery persons so you can assign orders to them.
      </p>
      {users.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No users yet.</p>
      ) : (
        users.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-base uppercase text-maroon">
                {(u.name ?? u.email ?? "?").charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{u.name ?? "No name"}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email ?? "No email"}</p>
                <span className="mt-1 inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {u.role ?? "user"}
                </span>
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={u.role ?? "user"} onValueChange={(v) => changeRole(u.id, v)}>
                <SelectTrigger className="h-10 border-border bg-background text-foreground"><SelectValue /></SelectTrigger>
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
/* Database tab                                                         */
/* ------------------------------------------------------------------ */
function DatabaseTab() {
  const [result, setResult] = useState<{ connected: boolean; error: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      setResult(await checkSupabaseConnection());
    } catch (err) {
      setResult({ connected: false, error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setBusy(false);
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
            <h3 className="font-display text-lg uppercase tracking-wide">Supabase Postgres</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">Test the database connection from the frontend.</p>
          </div>
        </div>
        <Button onClick={run} disabled={busy} className="mt-4">
          <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} />
          {result ? "Test again" : "Test connection"}
        </Button>
      </div>
      {result && (
        result.connected ? (
          <div className="rounded-2xl border border-green-500/40 bg-green-50 p-5">
            <p className="flex items-center gap-2 font-bold text-green-700"><CheckCircle2 className="size-5" /> Connected to Supabase</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-red-500/40 bg-red-50 p-5">
            <p className="flex items-center gap-2 font-bold text-red-700"><XCircle className="size-5" /> Not connected</p>
            <p className="mt-2 break-words text-xs leading-relaxed text-red-700/80">{result.error}</p>
          </div>
        )
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin panel                                                          */
/* ------------------------------------------------------------------ */
const tabs = [
  { id: "orders", label: "Orders", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "offers", label: "Offers", icon: Tag },
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
          <Button variant="ghost" asChild className="hidden text-muted-foreground hover:bg-muted hover:text-maroon sm:inline-flex">
            <Link to="/"><UtensilsCrossed className="size-4" /> View site</Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-maroon">Admin panel</p>
        <h1 className="mt-2 font-display text-3xl uppercase leading-[0.95] tracking-tight sm:text-4xl md:text-5xl">
          Full <span className="font-script font-bold normal-case text-maroon">control</span>
        </h1>
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 sm:mt-6 sm:gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors", tab === t.id ? "border-gold bg-gold text-[#3a2403]" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-6">
          {tab === "orders" && <OrdersTab />}
          {tab === "analytics" && <AnalyticsTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "offers" && <OffersTab />}
          {tab === "staff" && <StaffTab />}
          {tab === "database" && <DatabaseTab />}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gate                                                                 */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const [roleStatus, setRoleStatus] = useState<{ isAdmin: boolean; adminExists: boolean } | null>(null);
  const location = useLocation();

  useEffect(() => {
    getRoleStatus().then(setRoleStatus).catch(console.error);
  }, []);

  if (isLoading || roleStatus === null) return <PanelLoading />;
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (roleStatus.isAdmin) return <AdminPanel />;
  if (!roleStatus.adminExists) return <AdminBootstrap />;
  return <Navigate to="/dashboard" replace />;
}
