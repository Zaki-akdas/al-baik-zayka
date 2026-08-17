import { describe, expect, it } from "vitest";

import {
  ORDER_STATUSES,
  customerTimeline,
  formatOrderId,
  formatOrderTime,
  orderStatusLabels,
  type OrderStatus,
} from "./orders";

describe("order statuses", () => {
  it("has a label for every status", () => {
    for (const status of ORDER_STATUSES) {
      expect(orderStatusLabels[status], status).toBeTruthy();
    }
  });

  it("does not define labels for unknown statuses", () => {
    expect(Object.keys(orderStatusLabels).sort()).toEqual(
      [...ORDER_STATUSES].sort(),
    );
  });

  it("covers the full lifecycle in the right order", () => {
    expect(ORDER_STATUSES).toEqual([
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ]);
  });

  it("exposes the customer timeline without cancelled", () => {
    expect(customerTimeline).toEqual([
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
    ]);
  });
});

describe("formatOrderId", () => {
  it("shows the last 6 characters uppercased", () => {
    expect(formatOrderId("abc123def456")).toBe("#DEF456");
  });

  it("handles short ids", () => {
    expect(formatOrderId("ab")).toBe("#AB");
  });
});

describe("formatOrderTime", () => {
  it("formats a timestamp as a readable local string", () => {
    const out = formatOrderTime(0);
    // Locale-dependent formatting — assert it rendered date/time parts.
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(5);
    expect(out).toMatch(/[0-9]/);
  });
});

describe("type safety", () => {
  it("keeps the label record keyed by status", () => {
    const label: Record<OrderStatus, string> = orderStatusLabels;
    expect(label.delivered).toBe("Delivered");
  });
});
