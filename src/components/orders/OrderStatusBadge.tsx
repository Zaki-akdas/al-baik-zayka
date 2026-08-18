import { orderStatusLabels, type OrderStatus } from "@/data/orders";
import { cn } from "@/lib/utils";

/** Pill colors — "dark" is for night backgrounds, "light" for paper backgrounds. */
export function statusPillClass(
  status: OrderStatus,
  theme: "light" | "dark" = "dark",
): string {
  if (theme === "light") {
    switch (status) {
      case "placed":
        return "border-amber-500/50 bg-amber-100 text-amber-800";
      case "confirmed":
        return "border-sky-500/50 bg-sky-100 text-sky-800";
      case "preparing":
        return "border-orange-500/50 bg-orange-100 text-orange-800";
      case "out_for_delivery":
        return "border-violet-500/50 bg-violet-100 text-violet-800";
      case "delivered":
        return "border-green-500/50 bg-green-100 text-green-800";
      case "cancelled":
        return "border-red-500/50 bg-red-100 text-red-800";
    }
  }
  switch (status) {
    case "placed":
      return "border-gold/40 bg-gold/15 text-gold";
    case "confirmed":
      return "border-sky-500/40 bg-sky-500/15 text-sky-300";
    case "preparing":
      return "border-orange-500/40 bg-orange-500/15 text-orange-300";
    case "out_for_delivery":
      return "border-violet-500/40 bg-violet-500/15 text-violet-300";
    case "delivered":
      return "border-green-500/40 bg-green-500/15 text-green-300";
    case "cancelled":
      return "border-red-500/40 bg-red-500/15 text-red-300";
  }
}

export function OrderStatusBadge({
  status,
  theme = "dark",
}: {
  status: OrderStatus;
  theme?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        statusPillClass(status, theme),
      )}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
