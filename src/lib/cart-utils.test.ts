import { describe, expect, it } from "vitest";

import {
  addLine,
  cartCount,
  cartTotal,
  removeLine,
  setLineQty,
  type CartLine,
} from "./cart-utils";

const burger: CartLine = { id: "b1", name: "Zayka Special Burger", price: 129, qty: 1 };
const fries: CartLine = { id: "f1", name: "Loaded Fries", price: 99, qty: 2 };

describe("addLine", () => {
  it("appends a new line", () => {
    expect(addLine([], "b1", burger.name, 129)).toEqual([burger]);
  });

  it("bumps the quantity of an existing line", () => {
    const result = addLine([burger], "b1", burger.name, 129, 2);
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(3);
  });

  it("updates the price when the same id is re-added", () => {
    const result = addLine([burger], "b1", burger.name, 149);
    expect(result[0].price).toBe(149);
  });

  it("does not mutate the original array", () => {
    const original = [burger];
    addLine(original, "f1", fries.name, 99);
    expect(original).toHaveLength(1);
  });
});

describe("setLineQty", () => {
  it("sets the quantity", () => {
    const result = setLineQty([burger], "b1", 4);
    expect(result[0].qty).toBe(4);
  });

  it("removes the line when qty drops to 0", () => {
    expect(setLineQty([burger], "b1", 0)).toEqual([]);
  });

  it("removes the line for negative quantities", () => {
    expect(setLineQty([burger, fries], "b1", -1)).toEqual([fries]);
  });

  it("leaves other lines untouched", () => {
    const result = setLineQty([burger, fries], "f1", 1);
    expect(result[0]).toEqual(burger);
    expect(result[1].qty).toBe(1);
  });
});

describe("removeLine", () => {
  it("removes the matching line only", () => {
    expect(removeLine([burger, fries], "b1")).toEqual([fries]);
  });

  it("is a no-op for unknown ids", () => {
    expect(removeLine([burger], "nope")).toEqual([burger]);
  });
});

describe("cartCount / cartTotal", () => {
  it("counts total items across lines", () => {
    expect(cartCount([burger, fries])).toBe(3);
    expect(cartCount([])).toBe(0);
  });

  it("sums price × qty for the total", () => {
    // 129 + 99*2 = 327
    expect(cartTotal([burger, fries])).toBe(327);
    expect(cartTotal([])).toBe(0);
  });
});
