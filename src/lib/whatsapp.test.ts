import { describe, expect, it } from "vitest";

import { restaurant } from "@/data/restaurant";
import {
  cartOrderMessage,
  generalOrderMessage,
  itemOrderMessage,
  offerOrderMessage,
  waLink,
} from "./whatsapp";

describe("waLink", () => {
  it("builds a wa.me link with the restaurant's number", () => {
    expect(waLink("Hello")).toBe(
      `https://wa.me/${restaurant.whatsappNumber}?text=Hello`,
    );
  });

  it("URL-encodes the message", () => {
    const link = waLink("Hi there\nLine 2");
    expect(link).toContain("Hi%20there%0ALine%202");
    expect(link).not.toContain(" ");
  });
});

describe("order messages", () => {
  it("includes the restaurant name and contact placeholders", () => {
    const msg = generalOrderMessage;
    expect(msg).toContain(restaurant.name);
    expect(msg).toContain("Name:");
    expect(msg).toContain("Address:");
  });

  it("lists cart lines with quantities", () => {
    const msg = cartOrderMessage([
      { id: "b1", name: "Zayka Special Burger", qty: 2 },
      { id: "f1", name: "Loaded Fries", qty: 1 },
    ]);
    expect(msg).toContain("1. Zayka Special Burger × 2");
    expect(msg).toContain("2. Loaded Fries × 1");
  });

  it("is empty-safe for an empty cart", () => {
    const msg = cartOrderMessage([]);
    expect(msg).toContain("Items:");
    expect(msg).not.toContain("×");
  });

  it("names the item in a single-item order", () => {
    expect(itemOrderMessage("Chicken Shawarma")).toContain(
      "Chicken Shawarma",
    );
  });

  it("quotes the offer title", () => {
    expect(offerOrderMessage("Zayka Combo")).toContain('"Zayka Combo"');
  });
});
