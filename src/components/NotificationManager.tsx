import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";

/**
 * Global component that monitors the user's orders and fires browser
 * notifications when an order's status changes. Placed in the app tree
 * once so every page benefits.
 */
export function NotificationManager() {
  const { isAuthenticated } = useAuth();
  const orders = useQuery(
    api.orders.myOrders,
    isAuthenticated ? {} : "skip",
  );
  const { checkOrderStatusChange, lastStatusRef, permission } =
    useNotifications();

  // Sync initial statuses into the ref without triggering notifications
  useEffect(() => {
    if (!orders) return;
    for (const order of orders) {
      const id = order._id as string;
      if (!lastStatusRef.current.has(id)) {
        lastStatusRef.current.set(id, order.status);
      }
    }
  }, [orders, lastStatusRef]);

  // Detect status changes and fire notifications
  useEffect(() => {
    if (!orders || permission !== "granted") return;

    for (const order of orders) {
      const id = order._id as string;
      const prev = lastStatusRef.current.get(id);

      if (prev !== undefined && prev !== order.status) {
        checkOrderStatusChange(id, prev, order.status);
      }

      lastStatusRef.current.set(id, order.status);
    }
  }, [orders, permission, checkOrderStatusChange, lastStatusRef]);

  // Register the service worker for background notifications
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {
        // SW registration failed — notifications still work via the Notification API
      });
  }, []);

  return null;
}
