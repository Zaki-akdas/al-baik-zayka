/**
 * Combo / offer data — editable placeholders. No prices, discounts or
 * percentages are invented. Replace `image` with real offer posts from
 * Instagram and set `price` / `originalPrice` / `validUntil` once confirmed.
 */

export interface Offer {
  id: string;
  title: string;
  badge: "COMBO" | "TODAY'S SPECIAL" | "LIMITED OFFER" | "NEW";
  description: string;
  price: number | null;
  originalPrice: number | null;
  image: string;
  validUntil: string | null;
  isActive: boolean;
}

const img = (id: string, w = 1100) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const offers: Offer[] = [
  {
    id: "zayka-special-combo",
    title: "Zayka Special",
    badge: "COMBO",
    description:
      "Our signature combo — the burger, fries and drink that started it all. Ask us about today's combo deal.",
    price: null,
    originalPrice: null,
    image: img("photo-1594212699903-ec8a3eca50f5"),
    validUntil: null,
    isActive: true,
  },
  {
    id: "today-special",
    title: "Today's Special",
    badge: "TODAY'S SPECIAL",
    description:
      "A rotating pick straight from the kitchen. Check Instagram or ask at the counter for what's on today.",
    price: null,
    originalPrice: null,
    image: img("photo-1544025162-d76694265947"),
    validUntil: null,
    isActive: true,
  },
  {
    id: "value-combo",
    title: "Value Combo",
    badge: "COMBO",
    description:
      "Smart eats for everyday cravings — grab a filling combo without breaking the bank.",
    price: null,
    originalPrice: null,
    image: img("photo-1607013251379-e6eecfffe234"),
    validUntil: null,
    isActive: true,
  },
  {
    id: "family-combo",
    title: "Family Combo",
    badge: "COMBO",
    description:
      "Enough to feed the whole crew — burgers, wraps, fries and more for the table.",
    price: null,
    originalPrice: null,
    image: img("photo-1562967914-608f82629710"),
    validUntil: null,
    isActive: true,
  },
  {
    id: "weekend-offer",
    title: "Weekend Offer",
    badge: "LIMITED OFFER",
    description:
      "Weekend-only cravings, posted fresh on Instagram. Follow @albaik_zayka so you never miss it.",
    price: null,
    originalPrice: null,
    image: img("photo-1565299624946-b28f40a0ae38"),
    validUntil: null,
    isActive: true,
  },
];
