import { describe, expect, it } from "vitest";

import { addressLine, restaurant } from "./restaurant";

describe("restaurant contact data", () => {
  it("derives the international phone from the local phone", () => {
    expect(restaurant.phone).toBe("8269516101");
    expect(restaurant.phoneIntl).toBe(`+91${restaurant.phone}`);
  });

  it("uses the country code for WhatsApp", () => {
    expect(restaurant.whatsappNumber).toBe(`91${restaurant.phone}`);
  });

  it("points to the correct Instagram profile", () => {
    expect(restaurant.instagramHandle).toBe("@albaik_zayka");
    expect(restaurant.instagramUrl).toContain("instagram.com/albaik_zayka");
  });

  it("keeps only verified location clues", () => {
    expect(addressLine).toBe(
      "Rajdhani Petrol Pump, Baba Fareed Gali, Near Sheikh Saab Masjid",
    );
  });

  it("states home delivery is available", () => {
    expect(restaurant.deliveryAvailable).toBe(true);
  });
});
