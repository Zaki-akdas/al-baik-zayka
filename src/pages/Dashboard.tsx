import { useQuery } from "convex/react";
import { Link } from "react-router";
import {
  ArrowRight,
  Check,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/orders/PanelHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { useAuth } from "@/hooks/use-auth";
import { restaurant } from "@/data/restaurant";
import {
  ORDER_STATUSES,
  customerTimeline,
  formatOrderId,
  formatOrderTime,
  orderStatusLabels,
} from "@/data/orders";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

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
      <p className="text-xs font-semibold text-red-300">
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
                done && "border-gold bg-gold text-[#3a2403]",
                !done && active && "border-gold text-gold",
                !done && !active && "border-white/20 text-white/30",
              )}
            >
              {done && <Check className="size-3" />}
            </span>
            <span
              className={cn(
                (done || active) ? "text-white/80" : "text-white/35",
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
  const itemsSummary = order.items
    .map((it) => `${it.qty} × ${it.name}`)
    .join(", ");

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg uppercase tracking-wide">
            {formatOrderId(order._id)}
          </p>
          <p className="text-xs text-white/45">{formatOrderTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.orderType === "delivery" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
              <Truck className="size-3" /> Delivery
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
              <ShoppingBag className="size-3" /> Pickup
            </span>
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm leading-relaxed text-white/80">{itemsSummary}</p>
          {order.orderType === "delivery" && order.address && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-white/50">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold" />
              {order.address}
            </p>
          )}
          {order.notes && (
            <p className="mt-1 text-xs text-white/50">Note: {order.notes}</p>
          )}
          <OrderTimeline order={order} />
        </div>
        <div className="flex flex-col items-start justify-between gap-3 sm:items-end">
          <p className="font-display text-3xl text-gold-bright">
            ₹{order.total}
          </p>
          {order.status === "placed" && (
            <p className="text-xs text-white/50">
              Waiting for the restaurant to confirm.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const orders = useQuery(api.orders.myOrders);

  return (
    <div className="min-h-screen bg-night text-cream">
      <PanelHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            My Orders
          </p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
            Namaste,{" "}
            <span className="font-script font-bold normal-case text-gold-bright">
              {firstName(user?.name, user?.email)}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
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
              className="h-12 border-white/15 px-7 text-base text-white/80 hover:bg-white/5 hover:text-white"
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
              className="h-12 border-white/15 px-7 text-base text-white/80 hover:bg-white/5 hover:text-white"
            >
              <a href={telLink}>
                <Phone className="size-5" />
                Call {restaurant.phone}
              </a>
            </Button>
          </div>
        </section>

        {/* Orders */}
        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
            Your{" "}
            <span className="font-script font-bold normal-case text-gold-bright">
              orders
            </span>
          </h2>

          {orders === undefined ? (
            <p className="mt-6 text-sm text-white/50">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                <ShoppingBag className="size-6" />
              </span>
              <p className="font-semibold">No orders yet</p>
              <p className="max-w-sm text-sm text-white/55">
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
