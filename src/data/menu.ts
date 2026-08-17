/**
 * Menu data — editable placeholders derived from the food visible on
 * Al-Baik Zayka's Instagram. No prices are invented: every item has
 * `price: null` (displays "Price to be updated") until real menu prices
 * are confirmed from the restaurant.
 */

export const menuCategories = [
  "Burgers",
  "Shawarma & Wraps",
  "Pizza",
  "Fries & Sides",
  "Combos",
  "Beverages",
  "Specials",
] as const;

export type MenuCategory = (typeof menuCategories)[number];

/** Any string is allowed — the restaurant admin can add new categories. */
export type MenuCategoryName = string;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryName;
  description: string;
  /** Set to a number once the real price is confirmed. */
  price: number | null;
  image: string;
  isPopular?: boolean;
  isOffer?: boolean;
  isAvailable?: boolean;
  /** true = vegetarian, false = non-vegetarian, undefined = unknown */
  veg?: boolean;
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export const menuItems: MenuItem[] = [
  // ---------- Burgers ----------
  {
    id: "zayka-special-burger",
    name: "Zayka Special Burger",
    category: "Burgers",
    description:
      "Our signature smash-style patty, house sauces, fresh veggies and a soft toasted bun.",
    price: null,
    image: img("photo-1568901346375-23c9450c58cd"),
    isPopular: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "classic-chicken-burger",
    name: "Classic Chicken Burger",
    category: "Burgers",
    description:
      "Crispy chicken fillet, crunchy lettuce and creamy mayo in a soft bun.",
    price: null,
    image: img("photo-1571091718767-18b5b1457add"),
    isAvailable: true,
    veg: false,
  },
  {
    id: "cheese-loaded-burger",
    name: "Cheese Loaded Burger",
    category: "Burgers",
    description: "Double cheese, crunchy patty and our secret zayka sauce.",
    price: null,
    image: img("photo-1550547660-d9450f859349"),
    isPopular: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "spicy-tandoori-burger",
    name: "Spicy Tandoori Burger",
    category: "Burgers",
    description: "Char-grilled tandoori-style patty with spicy mayo and onions.",
    price: null,
    image: img("photo-1607013251379-e6eecfffe234"),
    isAvailable: true,
    veg: false,
  },
  // ---------- Shawarma & Wraps ----------
  {
    id: "chicken-shawarma",
    name: "Chicken Shawarma",
    category: "Shawarma & Wraps",
    description:
      "Freshly prepared shawarma with signature sauces and fillings.",
    price: null,
    image: img("photo-1529006557810-274b9b2fc783"),
    isPopular: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "zayka-special-wrap",
    name: "Zayka Special Wrap",
    category: "Shawarma & Wraps",
    description: "Grilled chicken, crunchy veggies and zayka sauce rolled tight.",
    price: null,
    image: img("photo-1606755962773-d324e0a13086"),
    isAvailable: true,
    veg: false,
  },
  {
    id: "double-chicken-wrap",
    name: "Double Chicken Wrap",
    category: "Shawarma & Wraps",
    description: "Extra chicken, double sauce — a proper handful of flavour.",
    price: null,
    image: img("photo-1528735602780-2552fd46c7af"),
    isAvailable: true,
    veg: false,
  },
  // ---------- Pizza ----------
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category: "Pizza",
    description: "Classic cheese pizza on a golden, crisp base.",
    price: null,
    image: img("photo-1513104890138-7c749659a591"),
    isAvailable: true,
    veg: true,
  },
  {
    id: "zayka-special-pizza",
    name: "Zayka Special Pizza",
    category: "Pizza",
    description: "Loaded with cheese and bold, spicy toppings.",
    price: null,
    image: img("photo-1565299624946-b28f40a0ae38"),
    isPopular: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "spicy-chicken-pizza",
    name: "Spicy Chicken Pizza",
    category: "Pizza",
    description: "Fiery chicken topping over a rich tomato base.",
    price: null,
    image: img("photo-1574071318508-1cdbab80d002"),
    isAvailable: true,
    veg: false,
  },
  // ---------- Fries & Sides ----------
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    category: "Fries & Sides",
    description: "Crispy fries topped with cheese and a generous drizzle of zayka sauce.",
    price: null,
    image: img("photo-1573080496219-bb080dd4f877"),
    isPopular: true,
    isAvailable: true,
    veg: true,
  },
  {
    id: "peri-peri-fries",
    name: "Peri Peri Fries",
    category: "Fries & Sides",
    description: "Golden fries tossed in fiery peri peri spice.",
    price: null,
    image: img("photo-1585109649139-366815a0d713"),
    isAvailable: true,
    veg: true,
  },
  {
    id: "cheesy-garlic-bread",
    name: "Cheesy Garlic Bread",
    category: "Fries & Sides",
    description: "Warm, buttery and loaded with melted cheese.",
    price: null,
    image: img("photo-1573140247632-f8fd74997d5c"),
    isAvailable: true,
    veg: true,
  },
  // ---------- Combos ----------
  {
    id: "zayka-combo",
    name: "Zayka Combo",
    category: "Combos",
    description: "A burger, fries and a drink — made for one hungry customer.",
    price: null,
    image: img("photo-1594212699903-ec8a3eca50f5"),
    isPopular: true,
    isOffer: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "family-combo",
    name: "Family Combo",
    category: "Combos",
    description: "A generous spread of favourites for the whole table.",
    price: null,
    image: img("photo-1562967914-608f82629710"),
    isOffer: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "shawarma-combo",
    name: "Shawarma Combo",
    category: "Combos",
    description: "Fresh shawarma with fries and a cool drink on the side.",
    price: null,
    image: img("photo-1626700051175-6818013e1d4f"),
    isAvailable: true,
    veg: false,
  },
  // ---------- Beverages ----------
  {
    id: "cold-drinks",
    name: "Cold Drinks",
    category: "Beverages",
    description: "Chilled soft drinks to complete your meal.",
    price: null,
    image: img("photo-1554866585-cd94860890b7"),
    isAvailable: true,
    veg: true,
  },
  {
    id: "milkshakes",
    name: "Milkshakes",
    category: "Beverages",
    description: "Thick and creamy shakes in your favourite flavours.",
    price: null,
    image: img("photo-1551024709-8f23befc6f87"),
    isAvailable: true,
    veg: true,
  },
  {
    id: "fresh-lime-soda",
    name: "Fresh Lime Soda",
    category: "Beverages",
    description: "Zingy, fizzy and refreshingly cool.",
    price: null,
    image: img("photo-1513558161293-cdaf765ed2fd"),
    isAvailable: true,
    veg: true,
  },
  // ---------- Specials ----------
  {
    id: "todays-special",
    name: "Today's Special",
    category: "Specials",
    description: "Ask us what's fresh today — it changes with what's cooking.",
    price: null,
    image: img("photo-1544025162-d76694265947"),
    isOffer: true,
    isAvailable: true,
    veg: false,
  },
  {
    id: "zayka-special-plate",
    name: "Zayka Special Plate",
    category: "Specials",
    description: "A loaded plate of the day's best — built to share or devour solo.",
    price: null,
    image: img("photo-1585032226651-759b368d7246"),
    isAvailable: true,
    veg: false,
  },
];

/** Items surfaced in the "What's cooking?" featured section (by id). */
export const featuredItemIds = [
  "zayka-special-burger",
  "chicken-shawarma",
  "zayka-special-pizza",
  "loaded-fries",
  "zayka-combo",
  "classic-chicken-burger",
];
