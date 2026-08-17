import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  CookingPot,
  MapPin,
  Navigation,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/orders/PanelHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderId, formatOrderTime } from "@/data/orders";
import { cn } from "@/lib/utils";

type Order = Doc<"orders">;

type NextStatus = "confirmed" | "preparing" | "out_for_delivery" | "delivered";

function nextAction(order: Order): {
  label: string;
  next: NextStatus | null;
  icon: typeof Check;
} | null {
  switch (order.status) {
    case "placed":
      return { label: "Confirm order", next: "confirmed", icon: Check };
    case "confirmed":
      return { label: "Start preparing", next: "preparing", icon: CookingPot };
    case "preparing":
      return { label: "Out for delivery", next: "out_for_delivery", icon: Truck };
    case "out_for_delivery":
      return { label: "Mark delivered", next: "delivered", icon: Check };
    default:
      return null;
  }
}

function DeliveryCard({ order }: { order: Order }) {
  const setStatus = useMutation(api.orders.setStatus);
  const [busy, setBusy] = useState(false);
  const action = nextAction(order);

  const update = async (next: NextStatus) => {
    setBusy(true);
    try {
      await setStatus({ orderId: order._id, status: next });
      toast(`Order ${formatOrderId(order._id)} updated`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setBusy(false);
    }
  };

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
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-white/90">{order.customerName}</p>
        <a
          href={`tel:${order.customerPhone}`}
          className="flex w-fit items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1.5 font-bold text-green-300"
        >
          <Phone className="size-4" />
          {order.customerPhone}
        </a>
        {order.orderType === "delivery" && (
          <p className="flex items-start gap-1.5 text-white/65">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
            {order.address}
          </p>
        )}
        {order.notes && <p className="text-white/50">Note: {order.notes}</p>}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-night/50 p-3 text-sm text-white/75">
        <p className="leading-relaxed">{itemsSummary}</p>
        <p className="mt-2 font-display text-xl text-gold-bright">
          ₹{order.total}
          <span className="ml-2 text-xs font-sans font-medium text-white/40">
            {order.orderType === "delivery" ? "Delivery" : "Pickup"}
          </span>
        </p>
      </div>

      {action && (
        <Button
          size="lg"
          className={cn(
            "mt-4 h-12 w-full text-base",
            order.status === "out_for_delivery" &&
              "bg-green-600 text-white hover:bg-green-700",
          )}
          onClick={() => update(action.next!)}
          disabled={busy}
        >
          <action.icon className="size-5" />
          {busy ? "Updating…" : action.label}
        </Button>
      )}
    </article>
  );
}

export default function Delivery() {
  const orders = useQuery(api.orders.myAssigned);

  return (
    <div className="min-h-screen bg-night text-cream">
      <PanelHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
          Delivery dashboard
        </p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Assigned{" "}
          <span className="font-script font-bold normal-case text-gold-bright">
            orders
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          Orders assigned to you by the restaurant, with one-tap status
          updates. Tap the phone number to call the customer.
        </p>

        {orders === undefined ? (
          <p className="mt-8 text-sm text-white/50">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Navigation className="size-6" />
            </span>
            <p className="font-semibold">No deliveries right now</p>
            <p className="max-w-sm text-sm text-white/55">
              New orders assigned to you will appear here. Keep the app handy —
              your next run is on its way.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <DeliveryCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
