import { useEffect, useRef } from "react";
import { listMyOrders } from "@/lib/db";
import type { Order } from "@/lib/db";

export function NotificationManager() {
  const prevStatusesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const checkOrders = async () => {
      try {
        const orders = await listMyOrders();
        for (const order of orders) {
          const prevStatus = prevStatusesRef.current.get(order.id);
          if (prevStatus && prevStatus !== order.status && order.status !== "cancelled") {
            if ("Notification" in window && Notification.permission === "granted") {
              const messages: Record<string, string> = {
                confirmed: "Your order has been confirmed! 🎉",
                preparing: "Your food is being prepared 👨‍🍳",
                out_for_delivery: "Your order is on its way! 🚗",
                delivered: "Your order has been delivered! Enjoy your meal 🍔",
              };
              const body = messages[order.status] ?? `Order status: ${order.status}`;
              new Notification("Al-Baik Zayka", {
                body,
                icon: "/logo.svg",
                tag: `order-${order.id}`,
              });
            }
          }
          prevStatusesRef.current.set(order.id, order.status);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    // Check every 20 seconds
    const interval = setInterval(checkOrders, 20_000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
