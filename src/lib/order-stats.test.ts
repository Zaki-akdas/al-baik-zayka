import { describe, expect, it } from "vitest";

import { computeOrderStats, type OrderLike } from "./order-stats";

const dayMs = 24 * 60 * 60 * 1000;
const now = Date.now();

function order(partial: Partial<OrderLike> & Pick<OrderLike, "createdAt">): OrderLike {
  return {
    status: "placed",
    total: 0,
    items: [],
    ...partial,
  };
}

describe("computeOrderStats", () => {
  it("returns zeros for an empty order list", () => {
    const stats = computeOrderStats([]);
    expect(stats.today).toEqual({ count: 0, revenue: 0, itemsSold: 0 });
    expect(stats.pendingCount).toBe(0);
    expect(stats.topCategories).toEqual([]);
    expect(stats.topCategoriesAllTime).toEqual([]);
  });

  it("counts revenue and orders placed today", () => {
    const stats = computeOrderStats([
      order({
        createdAt: now,
        status: "delivered",
        total: 240,
        items: [
          { name: "Zayka Burger", qty: 2, price: 120 },
          { name: "Fries", qty: 1, price: 80 },
        ],
      }),
      order({ createdAt: now, status: "placed", total: 60, items: [] }),
    ]);
    expect(stats.today.count).toBe(2);
    expect(stats.today.revenue).toBe(300);
  });

  it("excludes cancelled orders from today's numbers", () => {
    const stats = computeOrderStats([
      order({ createdAt: now, status: "cancelled", total: 999, items: [] }),
    ]);
    expect(stats.today.count).toBe(0);
    expect(stats.today.revenue).toBe(0);
  });

  it("ignores orders from previous days", () => {
    const stats = computeOrderStats([
      order({ createdAt: now - dayMs, status: "delivered", total: 500, items: [] }),
      order({ createdAt: now - 2 * dayMs, status: "delivered", total: 400, items: [] }),
    ]);
    expect(stats.today.count).toBe(0);
    expect(stats.today.revenue).toBe(0);
  });

  it("sums item quantities and revenue across orders", () => {
    const stats = computeOrderStats([
      order({
        createdAt: now,
        total: 320,
        items: [
          { name: "Shawarma", qty: 2, price: 160 },
          { name: "Fries", qty: 1, price: 80 },
        ],
      }),
      order({
        createdAt: now,
        total: 80,
        items: [{ name: "Fries", qty: 1, price: 80 }],
      }),
    ]);
    expect(stats.today.itemsSold).toBe(4);
    const fries = stats.topCategories.find((t) => t.name === "Fries");
    expect(fries?.qty).toBe(2);
    expect(fries?.revenue).toBe(160);
  });

  it("ranks groups by quantity sold, then revenue", () => {
    const stats = computeOrderStats([
      order({
        createdAt: now,
        total: 300,
        items: [
          { name: "Fries", qty: 3, price: 80 },
          { name: "Shawarma", qty: 5, price: 160 },
        ],
      }),
    ]);
    expect(stats.topCategories.map((t) => t.name)).toEqual([
      "Shawarma",
      "Fries",
    ]);
    expect(stats.topCategories[0]?.revenue).toBe(800);
  });

  it("caps top categories at five", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      name: `Item ${i + 1}`,
      qty: 1,
      price: 10,
    }));
    const stats = computeOrderStats([
      order({ createdAt: now, total: 80, items }),
    ]);
    expect(stats.topCategories).toHaveLength(5);
    expect(stats.topCategoriesAllTime).toHaveLength(5);
  });

  it("ranks across all time, including previous days", () => {
    const stats = computeOrderStats([
      order({
        createdAt: now - 3 * dayMs,
        status: "delivered",
        total: 0,
        items: [{ name: "Shawarma", qty: 4, price: 160 }],
      }),
      order({
        createdAt: now,
        status: "delivered",
        total: 0,
        items: [
          { name: "Shawarma", qty: 1, price: 160 },
          { name: "Fries", qty: 5, price: 80 },
        ],
      }),
    ]);
    // Today's ranking only sees the fresh order.
    expect(stats.topCategories.map((t) => t.name)).toEqual(["Fries", "Shawarma"]);
    // All-time ranking adds yesterday's Shawarma, breaking the tie on revenue.
    expect(stats.topCategoriesAllTime.map((t) => t.name)).toEqual([
      "Shawarma",
      "Fries",
    ]);
    expect(stats.topCategoriesAllTime[0]?.qty).toBe(5);
    expect(stats.topCategoriesAllTime[1]?.qty).toBe(5);
  });

  it("excludes cancelled orders from the all-time ranking", () => {
    const stats = computeOrderStats([
      order({
        createdAt: now - dayMs,
        status: "cancelled",
        total: 0,
        items: [{ name: "Fries", qty: 9, price: 80 }],
      }),
      order({
        createdAt: now - dayMs,
        status: "delivered",
        total: 0,
        items: [{ name: "Burger", qty: 2, price: 120 }],
      }),
    ]);
    expect(stats.topCategoriesAllTime.map((t) => t.name)).toEqual(["Burger"]);
  });

  it("groups by category when a resolver is provided", () => {
    const categoryOf = (productId: string) =>
      productId === "p1" || productId === "p2" ? "Burgers & Rolls" : "Sides";

    const stats = computeOrderStats(
      [
        order({
          createdAt: now,
          status: "delivered",
          total: 0,
          items: [
            { productId: "p1", name: "Zayka Burger", qty: 3, price: 120 },
            { productId: "p2", name: "Chicken Shawarma", qty: 2, price: 160 },
            { productId: "p3", name: "Fries", qty: 6, price: 80 },
          ],
        }),
      ],
      (line) => categoryOf(line.productId ?? ""),
    );

    expect(stats.topCategories.map((t) => t.name)).toEqual([
      "Sides",
      "Burgers & Rolls",
    ]);
    const burgers = stats.topCategories.find((t) => t.name === "Burgers & Rolls");
    expect(burgers?.qty).toBe(5);
    expect(burgers?.revenue).toBe(680);
  });

  it("uses the category frozen on the order line", () => {
    const stats = computeOrderStats(
      [
        order({
          createdAt: now,
          status: "delivered",
          total: 0,
          items: [
            {
              category: "Burgers & Rolls",
              name: "Zayka Burger",
              qty: 3,
              price: 120,
            },
            {
              category: "Burgers & Rolls",
              name: "Chicken Shawarma",
              qty: 2,
              price: 160,
            },
            { category: "Sides", name: "Fries", qty: 6, price: 80 },
          ],
        }),
      ],
      (line) => line.category,
    );

    expect(stats.topCategories.map((t) => t.name)).toEqual([
      "Sides",
      "Burgers & Rolls",
    ]);
    expect(stats.topCategories.find((t) => t.name === "Burgers & Rolls")?.qty).toBe(5);
  });

  it("falls back to the item name when the category is unknown", () => {
    const stats = computeOrderStats(
      [
        order({
          createdAt: now,
          status: "delivered",
          total: 0,
          items: [
            { productId: "gone", name: "Old Burger", qty: 2, price: 100 },
            { productId: "gone2", name: "Old Fries", qty: 1, price: 80 },
          ],
        }),
      ],
      () => undefined,
    );
    expect(stats.topCategories.map((t) => t.name)).toEqual([
      "Old Burger",
      "Old Fries",
    ]);
  });

  it("counts placed and confirmed orders as pending", () => {
    const stats = computeOrderStats([
      order({ createdAt: now - dayMs, status: "placed", total: 0, items: [] }),
      order({ createdAt: now - dayMs, status: "confirmed", total: 0, items: [] }),
      order({ createdAt: now - dayMs, status: "delivered", total: 0, items: [] }),
      order({ createdAt: now - dayMs, status: "cancelled", total: 0, items: [] }),
    ]);
    expect(stats.pendingCount).toBe(2);
  });
});
