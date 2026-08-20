/**
 * Menu data — real items and prices from Al-Baik Zayka's menu.
 */

export const menuCategories = [
  "Specials",
  "Burgers & Wraps",
  "Pizza",
  "Snacks & Sides",
  "Chinese (H/F)",
  "Rolls & Soups",
  "Drinks & Desserts",
] as const;

export type MenuCategory = (typeof menuCategories)[number];

/** Emoji icons for each menu category for visual navigation. */
export const categoryIcons: Record<string, string> = {
  "Specials": "⭐",
  "Burgers & Wraps": "🌯",
  "Pizza": "🍕",
  "Snacks & Sides": "🍟",
  "Chinese (H/F)": "🍜",
  "Rolls & Soups": "🫔",
  "Drinks & Desserts": "☕",
};

/** Any string is allowed — the restaurant admin can add new categories. */
export type MenuCategoryName = string;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryName;
  description: string;
  /** Set to a number once the real price is confirmed. */
  price: number | null;
  /** Half-size price — when set, a Half/Full toggle is shown. */
  priceHalf?: number;
  image: string;
  isPopular?: boolean;
  isOffer?: boolean;
  isAvailable?: boolean;
  /** true = vegetarian, false = non-vegetarian, undefined = unknown */
  veg?: boolean;
}

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

/* ──────────────────────────────────────────────────────────────────
   ABZ Specials
   ────────────────────────────────────────────────────────────────── */
const specials = (name: string, desc: string, price: number, imageId: string, extra?: Partial<MenuItem>): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Specials",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg: false,
  ...extra,
});

/* ──────────────────────────────────────────────────────────────────
   Cold Coffee
   ────────────────────────────────────────────────────────────────── */
const coldCoffee = (name: string, price: number, imageId: string, extra?: Partial<MenuItem>): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Drinks & Desserts",
  description: `${name} — freshly prepared and chilled to perfection.`,
  price,
  image: img(imageId),
  isAvailable: true,
  veg: true,
  ...extra,
});

/* ──────────────────────────────────────────────────────────────────
   Beverages & Desserts
   ────────────────────────────────────────────────────────────────── */
const bevDessert = (name: string, price: number, desc: string, imageId: string, veg = true): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Drinks & Desserts",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Maggi
   ────────────────────────────────────────────────────────────────── */
const maggi = (name: string, price: number, desc: string, imageId: string, veg = true): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Snacks & Sides",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Snacks & Fries
   ────────────────────────────────────────────────────────────────── */
const snack = (name: string, price: number, desc: string, imageId: string, veg?: boolean | Partial<MenuItem>, extra?: Partial<MenuItem>): MenuItem => {
  const isVeg = typeof veg === "boolean" ? veg : false;
  const opts = typeof veg === "object" ? veg : extra;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    name,
    category: "Snacks & Sides",
    description: desc,
    price,
    image: img(imageId),
    isAvailable: true,
    veg: isVeg,
    ...opts,
  };
};

/* ──────────────────────────────────────────────────────────────────
   Tacco
   ────────────────────────────────────────────────────────────────── */
const tacco = (name: string, price: number, desc: string, imageId: string): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Burgers & Wraps",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg: false,
});

/* ──────────────────────────────────────────────────────────────────
   Loaded
   ────────────────────────────────────────────────────────────────── */
const loaded = (name: string, price: number, desc: string, imageId: string, veg?: boolean | Partial<MenuItem>, extra?: Partial<MenuItem>): MenuItem => {
  const isVeg = typeof veg === "boolean" ? veg : false;
  const opts = typeof veg === "object" ? veg : extra;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    name,
    category: "Burgers & Wraps",
    description: desc,
    price,
    image: img(imageId),
    isAvailable: true,
    veg: isVeg,
    ...opts,
  };
};

/* ──────────────────────────────────────────────────────────────────
   Twister Rolls
   ────────────────────────────────────────────────────────────────── */
const twister = (name: string, price: number, desc: string, imageId: string, veg = false): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Burgers & Wraps",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Sandwich
   ────────────────────────────────────────────────────────────────── */
const sandwich = (name: string, price: number, desc: string, imageId: string, veg = false): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Burgers & Wraps",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Burger
   ────────────────────────────────────────────────────────────────── */
const burger = (name: string, price: number, desc: string, imageId: string, veg?: boolean | Partial<MenuItem>, extra?: Partial<MenuItem>): MenuItem => {
  const isVeg = typeof veg === "boolean" ? veg : false;
  const opts = typeof veg === "object" ? veg : extra;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    name,
    category: "Burgers & Wraps",
    description: desc,
    price,
    image: img(imageId),
    isAvailable: true,
    veg: isVeg,
    ...opts,
  };
};

/* ──────────────────────────────────────────────────────────────────
   Pizza
   ────────────────────────────────────────────────────────────────── */
const pizza = (name: string, price: number, desc: string, imageId: string, veg?: boolean | Partial<MenuItem>, extra?: Partial<MenuItem>): MenuItem => {
  const isVeg = typeof veg === "boolean" ? veg : false;
  const opts = typeof veg === "object" ? veg : extra;
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    name,
    category: "Pizza",
    description: desc,
    price,
    image: img(imageId),
    isAvailable: true,
    veg: isVeg,
    ...opts,
  };
};

/* ──────────────────────────────────────────────────────────────────
   Chicken / Egg / Veg (H/F) — helper for dual-size items
   ────────────────────────────────────────────────────────────────── */
const hFItem = (
  category: MenuCategoryName,
  name: string,
  halfPrice: number,
  fullPrice: number,
  desc: string,
  imageId: string,
  veg: boolean,
): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category,
  description: desc,
  price: fullPrice,
  priceHalf: halfPrice,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Rolls
   ────────────────────────────────────────────────────────────────── */
const roll = (name: string, price: number, desc: string, imageId: string, veg = false): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Rolls & Soups",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

/* ──────────────────────────────────────────────────────────────────
   Soup
   ────────────────────────────────────────────────────────────────── */
const soup = (name: string, price: number, desc: string, imageId: string, veg = true): MenuItem => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
  name,
  category: "Rolls & Soups",
  description: desc,
  price,
  image: img(imageId),
  isAvailable: true,
  veg,
});

// ─── shared image IDs ──────────────────────────────────────────────
const I = {
  burger: "photo-1568901346375-23c9450c58cd",
  shawarma: "photo-1529006557810-274b9b2fc783",
  wrap: "photo-1606755962773-d324e0a13086",
  pizza: "photo-1513104890138-7c749659a591",
  pizza2: "photo-1565299624946-b28f40a0ae38",
  fries: "photo-1573080496219-bb080dd4f877",
  peri: "photo-1585109649139-366815a0d713",
  loaded: "photo-1585109649139-366815a0d713",
  chicken: "photo-1567620832903-9fc6debc209f",
  noodles: "photo-1569718212165-3a8278d5f624",
  rice: "photo-1603133872878-684f208fb84b",
  coffee: "photo-1551024709-8f23befc6f87",
  shake: "photo-1572490122747-3968b75cc699",
  icecream: "photo-1497034825429-c343d7c6a68f",
  mojito: "photo-1513558161293-cdaf765ed2fd",
  cake: "photo-1578985545062-69928b1d9587",
  maggi: "photo-1569718212165-3a8278d5f624",
  popcorn: "photo-1585735026415-0a44468a6e0c",
  wings: "photo-1567620832903-9fc6debc209f",
  nuggets: "photo-1562967916-eb82221dfb44",
  momo: "photo-1529692236671-f1f6cf9683ba",
  taco: "photo-1565299624946-b28f40a0ae38",
  sandwich: "photo-1528735602780-2552fd46c7af",
  sandwich2: "photo-1553909489-cd47e0907980",
  paneer: "photo-1631452180519-c014fe946bc7",
  egg: "photo-1525351484163-7529414344d8",
  soup: "photo-1547592166-23ac45744acd",
  salad: "photo-1512621776951-a57141f2eefd",
  lollipop: "photo-1544025162-d76694265947",
  pasta: "photo-1563379926898-05f4575a45d8",
} as const;

export const menuItems: MenuItem[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  ABZ Specials
  // ═══════════════════════════════════════════════════════════════════
  specials("ABZ Special Chicken Jumbo Twister", "Our signature jumbo twister loaded with special chicken filling and house sauces.", 150, I.wrap, { isPopular: true }),
  specials("ABZ Special Chicken Jumbo Shawarma", "Juicy jumbo shawarma packed with special chicken and zayka sauces.", 140, I.shawarma, { isPopular: true }),
  specials("ABZ Special Chicken King Burger", "A towering king burger with our special chicken patty and bold flavours.", 130, I.burger, { isPopular: true }),
  specials("ABZ Special Chi. Jumbo Sandwich", "Jumbo sandwich overflowing with special chicken and signature fillings.", 140, I.sandwich),
  specials("ABZ Special Loded King Jumbo Sandwich", "A loaded king jumbo sandwich packed with chicken, cheese and sauces.", 200, I.sandwich2),
  specials("ABZ Special Chicken Chesse Loded Pizza", "Loaded cheese pizza topped with special chicken and extra cheese.", 250, I.pizza2),
  specials("ABZ Special Chicken Chesse Pizza", "Classic cheese pizza with our special chicken topping.", 200, I.pizza),
  specials("ABZ Special Chicken Tocco", "Crispy chicken tocco with our signature spice blend.", 150, I.taco),

  // ═══════════════════════════════════════════════════════════════════
  //  Cold Coffee
  // ═══════════════════════════════════════════════════════════════════
  coldCoffee("Cold Coffee", 70, I.coffee),
  coldCoffee("Cold Coffee Thick Shake", 80, I.shake),
  coldCoffee("Cold Coffee Thick Shake With Ice Cream", 100, I.icecream),
  coldCoffee("Kitkat Shake", 100, I.shake, { isPopular: true }),

  // ═══════════════════════════════════════════════════════════════════
  //  Beverages & Desserts
  // ═══════════════════════════════════════════════════════════════════
  bevDessert("Mojito", 80, "Refreshing mojito — cool, fizzy and full of flavour.", I.mojito),
  bevDessert("Choco Lawa Cake", 80, "Rich chocolate lava cake — warm, gooey and irresistible.", I.cake, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Maggi
  // ═══════════════════════════════════════════════════════════════════
  maggi("Plain Maggi", 60, "Classic plain Maggi — simple and satisfying.", I.maggi),
  maggi("Veg Maggi", 80, "Maggi loaded with fresh vegetables.", I.maggi),
  maggi("Veg Che Maggi", 120, "Vegetable Maggi topped with melted cheese.", I.maggi),
  maggi("Chicken Maggi", 120, "Maggi tossed with tender chicken pieces.", I.chicken, false),
  maggi("Chicken che. Maggi", 150, "Chicken Maggi loaded with melted cheese.", I.chicken, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Snacks & Fries
  // ═══════════════════════════════════════════════════════════════════
  snack("Chicken Popcorn", 80, "Bite-sized crispy chicken popcorn — crunchy and addictive.", I.popcorn),
  snack("Chicken Boneless", 100, "Juicy boneless chicken pieces, perfectly fried.", I.chicken),
  snack("Chicken Hot Wings 4pcs", 80, "Fiery hot chicken wings — crispy on the outside, juicy inside.", I.wings),
  snack("Chicken Lollipop 4pcs", 100, "Succulent chicken lollipops with a spicy glaze.", I.lollipop),
  snack("Chicken Nuggets 10 Pcs", 120, "Golden crispy chicken nuggets — a crowd favourite.", I.nuggets),
  snack("French Fries Salted", 70, "Crispy golden fries, lightly salted.", I.fries, true),
  snack("Chet Masala Fries", 80, "Fries tossed in tangy chaat masala spice.", I.fries, true),
  snack("Peri Peri Fries", 80, "Golden fries tossed in fiery peri peri spice.", I.peri, true, { isPopular: true }),
  snack("VEG FRY MOMO's", 80, "Crispy fried vegetable momos with spicy dipping sauce.", I.momo, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Tacco
  // ═══════════════════════════════════════════════════════════════════
  tacco("Chicken Crunchy Tacco", 120, "Crunchy chicken taco with fresh toppings.", I.taco),
  tacco("Chicken Crunchy Cheese Tacco", 130, "Crunchy chicken taco loaded with melted cheese.", I.taco),
  tacco("Chicken Crunchy Corn Cheese Tacco", 130, "Crunchy taco with chicken, corn and cheese.", I.taco),
  tacco("Chicken Crunchy Corn Cheese Double Tacco", 140, "Double-layered crunchy taco with chicken, corn and cheese.", I.taco),

  // ═══════════════════════════════════════════════════════════════════
  //  Loaded
  // ═══════════════════════════════════════════════════════════════════
  loaded("Mini Loaded", 100, "Mini loaded fries with cheese, sauces and toppings.", I.loaded, true),
  loaded("Loaded", 150, "Fully loaded fries with cheese, sauces and generous toppings.", I.loaded, true, { isPopular: true }),
  loaded("Only Chicken Loaded", 200, "Loaded fries topped with extra chicken, cheese and zayka sauces.", I.loaded),

  // ═══════════════════════════════════════════════════════════════════
  //  Twister Rolls
  // ═══════════════════════════════════════════════════════════════════
  twister("Chicken Twister", 90, "Classic chicken twister — juicy chicken wrapped tight.", I.wrap),
  twister("Chicken Cheese Twister", 100, "Chicken twister loaded with melted cheese.", I.wrap),
  twister("Schezwan Chicken Twister", 100, "Spicy schezwan chicken twister with bold flavours.", I.wrap),
  twister("Chicken Sch. Egg Roll Twister", 150, "Schezwan egg roll twister loaded with chicken.", I.wrap),
  twister("Chicken Egg Roll Twister", 150, "Chicken and egg roll twister — a hearty classic.", I.wrap),
  twister("Chi. Ch. Sch. Egg Roll Twister", 160, "Loaded chicken, schezwan and egg roll twister.", I.wrap),
  twister("Veg Twister", 80, "Fresh veggie twister with crunchy vegetables.", I.wrap, true),
  twister("Veg Cheese Twister", 100, "Veggie twister topped with melted cheese.", I.wrap, true),
  twister("Veg Schezwan Twister", 100, "Spicy schezwan veggie twister.", I.wrap, true),
  twister("Veg Cheese Sch. Twister", 120, "Veggie twister with cheese and schezwan spice.", I.wrap, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Sandwich
  // ═══════════════════════════════════════════════════════════════════
  sandwich("White Chicken Sandwich", 80, "Classic white bread sandwich with tender chicken filling.", I.sandwich),
  sandwich("White Chicken Cheese Sandwich", 100, "Chicken sandwich with melted cheese on soft white bread.", I.sandwich),
  sandwich("White Jubbo Chicken Sandwich", 120, "Jumbo chicken sandwich — extra filling, extra flavour.", I.sandwich),
  sandwich("Chicken Schezwon Sandwich", 100, "Spicy schezwan chicken sandwich.", I.sandwich),
  sandwich("Chicken Sch. Cheese Sandwich", 120, "Schezwan chicken sandwich with melted cheese.", I.sandwich),
  sandwich("Chicken Egg Sandwich", 120, "Chicken and egg sandwich — a protein-packed meal.", I.sandwich2),
  sandwich("Chicken Egg Ch. Sandwich", 140, "Chicken and egg sandwich loaded with cheese.", I.sandwich2),
  sandwich("Veg Sandwich", 80, "Classic vegetable sandwich with fresh fillings.", I.sandwich, true),
  sandwich("Veg Schezwan Sandwich", 100, "Spicy schezwan vegetable sandwich.", I.sandwich, true),
  sandwich("Veg Cheese Schezwan Sandwich", 120, "Veg sandwich with cheese and schezwan spice.", I.sandwich, true),
  sandwich("Veg Cheese Sandwich", 100, "Vegetable sandwich loaded with melted cheese.", I.sandwich, true),
  sandwich("Paneer Sandwich", 150, "Soft paneer filling in a classic sandwich.", I.paneer, true),
  sandwich("Paneer Ch. Sandwich", 150, "Paneer sandwich loaded with cheese.", I.paneer, true),
  sandwich("Paneer Ch. Schez Sandwich", 170, "Paneer sandwich with cheese and schezwan spice.", I.paneer, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Burger
  // ═══════════════════════════════════════════════════════════════════
  burger("Chicken Burger", 80, "Crispy chicken fillet in a soft toasted bun.", I.burger),
  burger("Chicken Cheese Burger", 100, "Crispy chicken burger loaded with melted cheese.", I.burger, { isPopular: true }),
  burger("Schezwan Chicken Burger", 90, "Spicy schezwan chicken burger with bold flavours.", I.burger),
  burger("Grilled Chicken Burger", 90, "Char-grilled chicken patty with fresh toppings.", I.burger),
  burger("Chicken Egg Burger", 130, "Chicken burger topped with a fried egg.", I.burger),
  burger("Veg Burger", 80, "Classic vegetable burger with a crispy patty.", I.burger, true),
  burger("Veg Schezwan Burger", 100, "Spicy schezwan vegetable burger.", I.burger, true),
  burger("Veg Cheese Burger", 100, "Veggie burger loaded with melted cheese.", I.burger, true),
  burger("Veg Cheese Schezwan Burger", 120, "Veg burger with cheese and schezwan spice.", I.burger, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Pizza
  // ═══════════════════════════════════════════════════════════════════
  pizza("Chicken Pizza", 100, "Classic chicken pizza on a golden, crisp base.", I.pizza),
  pizza("Chicken Cheese Pizza", 130, "Chicken pizza loaded with melted cheese.", I.pizza, { isPopular: true }),
  pizza("Chicken Double che. Pizza",  150, "Double cheese chicken pizza — extra cheesy, extra delicious.", I.pizza2),
  pizza("Paneer Pizza", 130, "Soft paneer toppings on a classic pizza base.", I.paneer, true),
  pizza("Tomato Cheese Pizza", 100, "Fresh tomato and cheese pizza — simple and tasty.", I.pizza, true),
  pizza("Capycum Cheese Pizza", 100, "Capsicum and cheese pizza with a golden base.", I.pizza, true),
  pizza("Onion Cheese Pizza", 100, "Caramelised onion and cheese pizza.", I.pizza, true),
  pizza("Margherita Pizza", 100, "Classic margherita with rich tomato sauce and cheese.", I.pizza, true),
  pizza("Corn Pizza", 100, "Sweet corn and cheese pizza.", I.pizza, true),
  pizza("Veg Pizza", 100, "Mixed vegetable pizza loaded with fresh toppings.", I.pizza, true),
  pizza("Veg Cheese Pizza", 120, "Veggie pizza with extra melted cheese.", I.pizza2, true),
  pizza("Veg Schezwon Pizza", 120, "Spicy schezwan vegetable pizza.", I.pizza2, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Chicken (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Chicken Noodles", 100, 140, "Classic chicken noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Hakka Noodles", 100, 140, "Spicy hakka-style chicken noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Crispy Noodles", 110, 150, "Crispy chicken noodles with bold flavours.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Soya Chilly", 100, 140, "Chicken and soya in spicy chilli sauce.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Dragon Potato Chilly", 100, 140, "Dragon potato chilli with tender chicken.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Fried Rice", 100, 160, "Aromatic chicken fried rice.", I.rice, false),
  hFItem("Chinese (H/F)", "Chicken Schezwan Fried Rice", 120, 170, "Spicy schezwan chicken fried rice.", I.rice, false),
  hFItem("Chinese (H/F)", "Chicken Manchurian", 120, 160, "Chicken manchurian in rich gravy.", I.rice, false),
  hFItem("Chinese (H/F)", "Chicken Mixed Combi", 120, 180, "Mixed chicken combination — a hearty feast.", I.rice, false),
  hFItem("Chinese (H/F)", "Chicken Chilli Garlic Noodles", 110, 160, "Chilli garlic chicken noodles — bold and flavourful.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken White Sauce Pasta", 200, 320, "Creamy white sauce pasta with chicken.", I.pasta, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Egg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Egg Noodles", 60, 90, "Classic egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Schezwan Noodles", 70, 100, "Spicy schezwan egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Hakka Noodles", 70, 100, "Hakka-style egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Crispy Noodles", 70, 100, "Crispy egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Manchurian Noodles", 70, 100, "Egg noodles tossed in manchurian sauce.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Fried Rice", 60, 90, "Classic egg fried rice.", I.rice, false),
  hFItem("Chinese (H/F)", "Egg Schezwan Fried Rice", 70, 100, "Spicy schezwan egg fried rice.", I.rice, false),
  hFItem("Chinese (H/F)", "Egg Manchurian Fried Rice", 70, 100, "Egg fried rice with manchurian flavour.", I.rice, false),
  hFItem("Chinese (H/F)", "Egg Dry Manchurian", 80, 110, "Dry egg manchurian — bold and spicy.", I.rice, false),
  hFItem("Chinese (H/F)", "Egg Soya Chilly", 70, 100, "Egg and soya in spicy chilli sauce.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Pasta (Macaroni)", 70, 100, "Egg pasta (macaroni) in a flavourful sauce.", I.pasta, false),
  hFItem("Chinese (H/F)", "Egg Dragon Potato Chilly", 80, 110, "Dragon potato chilli with egg.", I.rice, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Veg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Noodles", 40, 60, "Classic plain noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Hakka Noodles", 50, 90, "Spicy hakka-style noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Schezwan Noodles", 60, 90, "Fiery schezwan noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Crispy Noodles", 60, 90, "Crispy noodles with bold flavour.", I.noodles, true),
  hFItem("Chinese (H/F)", "Manchurian Noodles", 60, 90, "Noodles tossed in manchurian sauce.", I.noodles, true),
  hFItem("Chinese (H/F)", "Fried Rice", 40, 60, "Classic vegetable fried rice.", I.rice, true),
  hFItem("Chinese (H/F)", "Schezwan Fried Rice", 60, 90, "Spicy schezwan vegetable fried rice.", I.rice, true),
  hFItem("Chinese (H/F)", "Manchurian Fried Rice", 60, 90, "Vegetable fried rice with manchurian flavour.", I.rice, true),
  hFItem("Chinese (H/F)", "Dry Manchurian", 50, 70, "Dry vegetable manchurian — spicy and crispy.", I.rice, true),
  hFItem("Chinese (H/F)", "Gravy Manchurian", 50, 70, "Vegetable manchurian in rich gravy.", I.rice, true),
  hFItem("Chinese (H/F)", "Mixed Combo", 70, 100, "Mixed vegetable combination — a hearty meal.", I.rice, true),
  hFItem("Chinese (H/F)", "Soya Chilly", 40, 60, "Soya chunks in spicy chilli sauce.", I.noodles, true),
  hFItem("Chinese (H/F)", "Dragon Potato Chilly", 60, 90, "Dragon potato chilli — bold and spicy.", I.noodles, true),
  hFItem("Chinese (H/F)", "Pasta/Macaroni", 40, 60, "Classic pasta/macaroni.", I.pasta, true),
  hFItem("Chinese (H/F)", "White Sauce Pasta", 80, 150, "Creamy white sauce vegetable pasta.", I.pasta, true),
  hFItem("Chinese (H/F)", "Veg Cheese Pasta", 80, 150, "Vegetable pasta loaded with cheese.", I.pasta, true),
  snack("Veg Fried Momos", 80, "Crispy fried vegetable momos with spicy sauce.", I.momo, true),
  snack("Veg Chilly Fried Momos", 110, "Veg momos tossed in spicy chilli sauce.", I.momo, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Rolls
  // ═══════════════════════════════════════════════════════════════════
  roll("Single Egg Vegetable Roll", 40, "Single egg vegetable roll — light and tasty.", I.wrap, true),
  roll("Double Egg Vegetable Roll", 50, "Double egg vegetable roll — protein-packed.", I.wrap, true),
  roll("Single Chowmein Roll", 50, "Chowmein wrapped in a soft roll.", I.wrap, true),
  roll("Double Chowmein Roll", 60, "Double chowmein roll — extra filling, extra flavour.", I.wrap, true),
  roll("Single Combo Roll", 70, "Single combo roll with mixed fillings.", I.wrap),
  roll("Double Combo Roll", 80, "Double combo roll — a hearty handful.", I.wrap),
  roll("Single Paneer Roll", 120, "Soft paneer wrapped in a flavourful roll.", I.paneer, true),
  roll("Double Paneer Roll", 130, "Double paneer roll — extra paneer, extra cheese.", I.paneer, true),
  roll("Single Chicken Roll", 110, "Juicy chicken wrapped in a classic roll.", I.wrap),
  roll("Double Chicken Roll", 120, "Double chicken roll — a proper feast.", I.wrap),
  roll("Single Dragon Potato Roll", 60, "Dragon potato roll with bold flavours.", I.wrap, true),
  roll("Double Dragon Potato Roll", 70, "Double dragon potato roll — extra crispy.", I.wrap, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Soup
  // ═══════════════════════════════════════════════════════════════════
  soup("Tomato Soup", 60, "Classic tomato soup — warm and comforting.", I.soup),
  soup("Veg Manchau Soup", 60, "Spicy manchau soup with mixed vegetables.", I.soup),
  soup("Veg Sweet Corn Soup", 70, "Sweet corn soup with a hint of pepper.", I.soup),
  soup("Veg Garlic Soup", 60, "Aromatic garlic soup with fresh herbs.", I.soup),
  soup("Veg Manchurian Soup", 60, "Manchurian soup — bold, spicy and warming.", I.soup),
  soup("Chicken Soup", 80, "Classic chicken soup — warm and satisfying.", I.soup, false),
];

/** Items surfaced in the "What's cooking?" featured section (by id). */
export const featuredItemIds = [
  "abz-special-chicken-jumbo-twister",
  "abz-special-chicken-jumbo-shawarma",
  "abz-special-chicken-king-burger",
  "abz-special-chicken-chesse-pizza",
  "abz-special-chicken-chesse-loded-pizza",
  "loaded",
];
