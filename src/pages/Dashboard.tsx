import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRight,
  Check,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Repeat,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useCart } from "@/lib/cart";
import { useNotifications } from "@/hooks/use-notifications";
import { restaurant } from "@/data/restaurant";
import {
  ORDER_STATUSES,
  customerTimeline,
  formatOrderId,
  formatOrderTime,
  orderStatusLabels,
} from "@/data/orders";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";
import { cn, friendlyErrorMessage } from "@/lib/utils";

type Order = Doc<"orders">;

function firstName(name?: string, email?: string): string {
  if (name) {
    const first = name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (email) return email.split("@")[0];
  return "foodie";
}

function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <p className="text-xs font-semibold text-red-600">
        This order was cancelled.
      </p>
    );
  }
  const current = ORDER_STATUSES.indexOf(order.status);
  return (
    <ol className="mt-4 space-y-1.5">
      {customerTimeline.map((step, i) => {
        const done = current > i;
        const active = current === i;
        return (
          <li key={step} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                done && "border-maroon bg-maroon text-cream",
                !done && active && "border-maroon text-maroon",
                !done && !active && "border-border text-muted-foreground/40",
              )}
            >
              {done && <Check className="size-3" />}
            </span>
            <span
              className={cn(
                (done || active) ? "text-foreground/80" : "text-muted-foreground/50",
              )}
            >
              {orderStatusLabels[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { add, setIsOpen } = useCart();
  const setStatus = useMutation(api.orders.setStatus);
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const itemsSummary = order.items
    .map((it) => `${it.qty} × ${it.name}`)
    .join(", ");

  const canCancel = order.status === "placed" || order.status === "confirmed";

  const repeatOrder = () => {
    for (const item of order.items) {
      add(item.productId ?? item.name, item.name, item.price, item.qty);
    }
    setIsOpen(true);
    toast("Items added to your cart");
  };

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      await setStatus({ orderId: order._id, status: "cancelled" });
      toast("Order cancelled");
      setShowCancelDialog(false);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not cancel order"));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg uppercase tracking-wide text-foreground">
              {formatOrderId(order._id)}
            </p>
            <p className="text-xs text-muted-foreground">{formatOrderTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            {order.orderType === "delivery" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <Truck className="size-3" /> Delivery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <ShoppingBag className="size-3" /> Pickup
              </span>
            )}
            <OrderStatusBadge status={order.status} theme="light" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">{itemsSummary}</p>
            {order.orderType === "delivery" && order.address && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-maroon" />
                {order.address}
              </p>
            )}
            {order.notes && (
              <p className="mt-1 text-xs text-muted-foreground">Note: {order.notes}</p>
            )}
            <OrderTimeline order={order} />
          </div>
          <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
            <p className="font-display text-3xl text-maroon">
              ₹{order.total}
            </p>
            {order.status === "placed" && (
              <p className="text-xs text-muted-foreground">
                Waiting for the restaurant to confirm.
              </p>
            )}
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {order.status === "delivered" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={repeatOrder}
                  className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  <Repeat className="size-3.5" />
                  Reorder
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="size-3.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">
              Cancel order?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will cancel order {formatOrderId(order._id)}. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Keep order
            </Button>
            <Button
              variant="destructive"
              onClick={cancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Cancel order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* User profile card                                                   */
/* ------------------------------------------------------------------ */
function UserProfileCard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-maroon/10 font-display text-lg uppercase text-maroon">
          {user?.name
            ? user.name.trim().charAt(0).toUpperCase()
            : user?.email?.charAt(0).toUpperCase() ?? "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.name || "Guest User"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || "Signed in anonymously"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={signingOut}
          className="shrink-0 border-border text-foreground/80 hover:bg-muted hover:text-foreground"
        >
          {signingOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Sign out
        </Button>
      </div>
    </div>
  );
}

function NotificationBanner() {
  const { permission, requestPermission, isSupported } = useNotifications();

  if (!isSupported || permission !== "default") return null;

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon">
            <Bell className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Get notified about your orders
            </p>
            <p className="text-xs text-muted-foreground">
              We'll let you know when your order status changes.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={requestPermission}
            className="h-9 px-4"
          >
            <Bell className="size-4" />
            Enable notifications
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => localStorage.setItem("abz-notification-dismissed", "1")}
            className="h-9 px-3 text-muted-foreground"
          >
            <BellOff className="size-4" />
            Not now
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const orders = useQuery(api.orders.myOrders);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelHeader theme="light" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-maroon">
            My Orders
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
            Hey,{" "}
            <span className="font-script font-bold normal-case text-maroon">
              {firstName(user?.name, user?.email)}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Track your orders from the kitchen to your door. Hungry again? Head
            back to the menu.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild className="h-12 bg-gold px-7 text-base font-bold text-[#3a2403] hover:bg-gold-bright">
              <Link to="/">
                Order Now
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-border px-7 text-base text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <a href={waLink(generalOrderMessage)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-5" />
                WhatsApp
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 border-border px-7 text-base text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <a href={telLink}>
                <Phone className="size-5" />
                Call {restaurant.phone}
              </a>
            </Button>
          </div>
        </section>

        {/* User Profile */}
        <section className="mt-10">
          <UserProfileCard />
        </section>

        {/* Notification opt-in */}
        <NotificationBanner />

        {/* Orders */}
        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase tracking-wide text-foreground sm:text-3xl">
            Your{" "}
            <span className="font-script font-bold normal-case text-maroon">
              orders
            </span>
          </h2>

          {orders === undefined ? (
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <Skeleton className="mb-2 h-5 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Skeleton className="mb-2 h-3 w-48" />
                      <Skeleton className="mb-1 h-3 w-36" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <div className="flex items-end justify-end">
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm">
              <span className="flex size-14 items-center justify-center rounded-full bg-maroon/10 text-maroon">
                <ShoppingBag className="size-6" />
              </span>
              <p className="font-semibold">No orders yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your order history will show up here. Grab something delicious
                from the menu to get started.
              </p>
              <Button asChild className="mt-2">
                <Link to="/">
                  Browse the menu
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
