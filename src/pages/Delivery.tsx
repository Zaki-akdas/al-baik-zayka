import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CookingPot,
  MapPin,
  Navigation,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import type { Order } from "@/lib/db";
import { listAssignedOrders, updateOrderStatus } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PanelHeader } from "@/components/orders/PanelHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderId, formatOrderTime } from "@/data/orders";
import { cn } from "@/lib/utils";

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

function DeliveryCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [busy, setBusy] = useState(false);
  const action = nextAction(order);

  const update = async (next: NextStatus) => {
    setBusy(true);
    try {
      await updateOrderStatus(order.id, next);
      toast(`Order ${formatOrderId(order.id)} updated`);
      onRefresh();
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
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg uppercase tracking-wide text-foreground">
            {formatOrderId(order.id)}
          </p>
          <p className="text-xs text-muted-foreground">{formatOrderTime(new Date(order.created_at).getTime())}</p>
        </div>
        <OrderStatusBadge status={order.status as any} theme="light" />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <p className="font-semibold text-foreground">{order.customer_name}</p>
        <a
          href={`tel:${order.customer_phone}`}
          className="flex w-fit items-center gap-1.5 rounded-full border border-green-500/50 bg-green-100 px-3 py-1.5 font-bold text-green-800"
        >
          <Phone className="size-4" />
          {order.customer_phone}
        </a>
        {order.order_type === "delivery" && (
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-maroon" />
            {order.address}
          </p>
        )}
        {order.notes && <p className="text-muted-foreground">Note: {order.notes}</p>}
      </div>

      <div className="mt-3 rounded-xl border border-border bg-muted p-3 text-sm text-foreground/80">
        <p className="leading-relaxed">{itemsSummary}</p>
        <p className="mt-2 font-display text-xl text-maroon">
          ₹{order.total}
          <span className="ml-2 text-xs font-sans font-medium text-muted-foreground">
            {order.order_type === "delivery" ? "Delivery" : "Pickup"}
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
  const [orders, setOrders] = useState<Order[] | null>(null);

  const refresh = useCallback(async () => {
    try {
      setOrders(await listAssignedOrders());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelHeader theme="light" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-maroon">
          Delivery dashboard
        </p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] tracking-tight text-foreground sm:text-6xl">
          Assigned{" "}
          <span className="font-script font-bold normal-case text-maroon">
            orders
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Orders assigned to you by the restaurant, with one-tap status
          updates. Tap the phone number to call the customer.
        </p>

        {orders === null ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-full bg-maroon/10 text-maroon">
              <Navigation className="size-6" />
            </span>
            <p className="font-semibold">No deliveries right now</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              New orders assigned to you will appear here. Keep the app handy —
              your next run is on its way.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <DeliveryCard key={order.id} order={order} onRefresh={refresh} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
