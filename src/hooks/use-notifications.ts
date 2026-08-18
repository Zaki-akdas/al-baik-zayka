import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { orderStatusLabels, type OrderStatus } from "@/data/orders";

const STORAGE_KEY = "abz-notification-permission";

export type NotificationPermission = "granted" | "denied" | "default";

/**
 * Requests browser notification permission and provides a helper to show
 * order-status notifications. Falls back to toast notifications when
 * the browser doesn't support notifications or the user denied permission.
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    return Notification.permission as NotificationPermission;
  });
  const lastStatusRef = useRef<Map<string, string>>(new Map());

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.info("Notifications are not supported in this browser");
      return "denied" as NotificationPermission;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      localStorage.setItem(STORAGE_KEY, result);
      return result as NotificationPermission;
    } catch {
      // Fallback for older browsers
      return "denied" as NotificationPermission;
    }
  }, []);

  // Show a notification (or toast fallback)
  const notify = useCallback(
    (title: string, body: string, orderId?: string) => {
      if (permission === "granted" && "Notification" in window) {
        try {
          const notification = new Notification(title, {
            body,
            icon: "/logo.svg",
            badge: "/logo.svg",
            tag: orderId ? `order-${orderId}` : undefined,
            renotify: true,
            vibrate: [200, 100, 200],
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          // Auto-close after 8 seconds
          setTimeout(() => notification.close(), 8000);
        } catch {
          // Fallback to toast
          toast(title, { description: body });
        }
      } else {
        // Toast fallback
        toast(title, { description: body });
      }
    },
    [permission],
  );

  // Check for order status changes and notify
  const checkOrderStatusChange = useCallback(
    (
      orderId: string,
      oldStatus: string | undefined,
      newStatus: string,
    ) => {
      if (!oldStatus || oldStatus === newStatus) return;
      if (newStatus === "cancelled" && oldStatus === "cancelled") return;

      const statusLabel = orderStatusLabels[newStatus as OrderStatus] ?? newStatus;
      const shortId = `#${orderId.slice(-6).toUpperCase()}`;

      notify(
        `Order ${shortId} — ${statusLabel}`,
        getStatusMessage(newStatus as OrderStatus),
        orderId,
      );
    },
    [notify],
  );

  return {
    permission,
    requestPermission,
    notify,
    checkOrderStatusChange,
    lastStatusRef,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}

function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case "confirmed":
      return "Your order has been confirmed by the restaurant!";
    case "preparing":
      return "Your food is being prepared right now 🔥";
    case "out_for_delivery":
      return "Your order is on its way to you! 🚚";
    case "delivered":
      return "Your order has been delivered. Enjoy your meal! 🎉";
    case "cancelled":
      return "Your order has been cancelled.";
    case "placed":
      return "Your order has been placed successfully.";
    default:
      return "Your order status has been updated.";
  }
}
