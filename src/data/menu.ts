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
export const menuItems: MenuItem[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  ABZ Specials
  // ═══════════════════════════════════════════════════════════════════
  specials("ABZ Special Chicken Jumbo Twister", "Our signature jumbo twister loaded with special chicken filling and house sauces.", 150, "photo-1626700051175-6818013e1d4f", { isPopular: true }),
  specials("ABZ Special Chicken Jumbo Shawarma", "Juicy jumbo shawarma packed with special chicken and zayka sauces.", 140, "photo-1529006557810-274b9b2fc783", { isPopular: true }),
  specials("ABZ Special Chicken King Burger", "A towering king burger with our special chicken patty and bold flavours.", 130, "photo-1568901346375-23c9450c58cd", { isPopular: true }),
  specials("ABZ Special Chi. Jumbo Sandwich", "Jumbo sandwich overflowing with special chicken and signature fillings.", 140, "photo-1553909489-cd47e0907980"),
  specials("ABZ Special Loded King Jumbo Sandwich", "A loaded king jumbo sandwich packed with chicken, cheese and sauces.", 200, "photo-1528735602780-2552fd46c7af"),
  specials("ABZ Special Chicken Chesse Loded Pizza", "Loaded cheese pizza topped with special chicken and extra cheese.", 250, "photo-1565299624946-b28f40a0ae38"),
  specials("ABZ Special Chicken Chesse Pizza", "Classic cheese pizza with our special chicken topping.", 200, "photo-1513104890138-7c749659a591"),
  specials("ABZ Special Chicken Tocco", "Crispy chicken tocco with our signature spice blend.", 150, "photo-1551218808-94e220e084d2"),

  // ═══════════════════════════════════════════════════════════════════
  //  Cold Coffee
  // ═══════════════════════════════════════════════════════════════════
  coldCoffee("Cold Coffee", 70, "photo-1461023058943-07fcbe16d735"),
  coldCoffee("Cold Coffee Thick Shake", 80, "photo-1572490122747-3968b75cc699"),
  coldCoffee("Cold Coffee Thick Shake With Ice Cream", 100, "photo-1579954115545-a95591f28bfc"),
  coldCoffee("Kitkat Shake", 100, "photo-1563805042-7684c019e1cb", { isPopular: true }),

  // ═══════════════════════════════════════════════════════════════════
  //  Beverages & Desserts
  // ═══════════════════════════════════════════════════════════════════
  bevDessert("Mojito", 80, "Refreshing mojito — cool, fizzy and full of flavour.", "photo-1513558161293-cdaf765ed2fd"),
  bevDessert("Choco Lawa Cake", 80, "Rich chocolate lava cake — warm, gooey and irresistible.", "photo-1578985545062-69928b1d9587", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Maggi
  // ═══════════════════════════════════════════════════════════════════
  maggi("Plain Maggi", 60, "Classic plain Maggi — simple and satisfying.", "photo-1612929633738-8fe44f7ec841"),
  maggi("Veg Maggi", 80, "Maggi loaded with fresh vegetables.", "photo-1585032226651-759b368d7246"),
  maggi("Veg Che Maggi", 120, "Vegetable Maggi topped with melted cheese.", "photo-1585032226651-759b368d7246"),
  maggi("Chicken Maggi", 120, "Maggi tossed with tender chicken pieces.", "photo-1569718212165-3a8278d5f624", false),
  maggi("Chicken che. Maggi", 150, "Chicken Maggi loaded with melted cheese.", "photo-1569718212165-3a8278d5f624", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Snacks & Fries
  // ═══════════════════════════════════════════════════════════════════
  snack("Chicken Popcorn", 80, "Bite-sized crispy chicken popcorn — crunchy and addictive.", "photo-1562967914-608f82629710"),
  snack("Chicken Boneless", 100, "Juicy boneless chicken pieces, perfectly fried.", "photo-1562967914-608f82629710"),
  snack("Chicken Hot Wings 4pcs", 80, "Fiery hot chicken wings — crispy on the outside, juicy inside.", "photo-1567620832903-9fc6debc209f"),
  snack("Chicken Lollipop 4pcs", 100, "Succulent chicken lollipops with a spicy glaze.", "photo-1544025162-d76694265947"),
  snack("Chicken Nuggets 10 Pcs", 120, "Golden crispy chicken nuggets — a crowd favourite.", "photo-1562967914-608f82629710"),
  snack("French Fries Salted", 70, "Crispy golden fries, lightly salted.", "photo-1573080496219-bb080dd4f877", true),
  snack("Chet Masala Fries", 80, "Fries tossed in tangy chaat masala spice.", "photo-1585109649139-366815a0d713", true),
  snack("Peri Peri Fries", 80, "Golden fries tossed in fiery peri peri spice.", "photo-1585109649139-366815a0d713", true, { isPopular: true }),
  snack("VEG FRY MOMO's", 80, "Crispy fried vegetable momos with spicy dipping sauce.", "photo-1529692236671-f1f6cf9683ba", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Tacco
  // ═══════════════════════════════════════════════════════════════════
  tacco("Chicken Crunchy Tacco", 120, "Crunchy chicken taco with fresh toppings.", "photo-1551218808-94e220e084d2"),
  tacco("Chicken Crunchy Cheese Tacco", 130, "Crunchy chicken taco loaded with melted cheese.", "photo-1565299624946-b28f40a0ae38"),
  tacco("Chicken Crunchy Corn Cheese Tacco", 130, "Crunchy taco with chicken, corn and cheese.", "photo-1552332386-f8dd00dc2f85"),
  tacco("Chicken Crunchy Corn Cheese Double Tacco", 140, "Double-layered crunchy taco with chicken, corn and cheese.", "photo-1552332386-f8dd00dc2f85"),

  // ═══════════════════════════════════════════════════════════════════
  //  Loaded
  // ═══════════════════════════════════════════════════════════════════
  loaded("Mini Loaded", 100, "Mini loaded fries with cheese, sauces and toppings.", "photo-1585109649139-366815a0d713", true),
  loaded("Loaded", 150, "Fully loaded fries with cheese, sauces and generous toppings.", "photo-1573080496219-bb080dd4f877", true, { isPopular: true }),
  loaded("Only Chicken Loaded", 200, "Loaded fries topped with extra chicken, cheese and zayka sauces.", "photo-1585109649139-366815a0d713"),

  // ═══════════════════════════════════════════════════════════════════
  //  Twister Rolls
  // ═══════════════════════════════════════════════════════════════════
  twister("Chicken Twister", 90, "Classic chicken twister — juicy chicken wrapped tight.", "photo-1606755962773-d324e0a13086"),
  twister("Chicken Cheese Twister", 100, "Chicken twister loaded with melted cheese.", "photo-1626700051175-6818013e1d4f"),
  twister("Schezwan Chicken Twister", 100, "Spicy schezwan chicken twister with bold flavours.", "photo-1606755962773-d324e0a13086"),
  twister("Chicken Sch. Egg Roll Twister", 150, "Schezwan egg roll twister loaded with chicken.", "photo-1626700051175-6818013e1d4f"),
  twister("Chicken Egg Roll Twister", 150, "Chicken and egg roll twister — a hearty classic.", "photo-1626700051175-6818013e1d4f"),
  twister("Chi. Ch. Sch. Egg Roll Twister", 160, "Loaded chicken, schezwan and egg roll twister.", "photo-1626700051175-6818013e1d4f"),
  twister("Veg Twister", 80, "Fresh veggie twister with crunchy vegetables.", "photo-1529006557810-274b9b2fc783", true),
  twister("Veg Cheese Twister", 100, "Veggie twister topped with melted cheese.", "photo-1529006557810-274b9b2fc783", true),
  twister("Veg Schezwan Twister", 100, "Spicy schezwan veggie twister.", "photo-1529006557810-274b9b2fc783", true),
  twister("Veg Cheese Sch. Twister", 120, "Veggie twister with cheese and schezwan spice.", "photo-1529006557810-274b9b2fc783", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Sandwich
  // ═══════════════════════════════════════════════════════════════════
  sandwich("White Chicken Sandwich", 80, "Classic white bread sandwich with tender chicken filling.", "photo-1553909489-cd47e0907980"),
  sandwich("White Chicken Cheese Sandwich", 100, "Chicken sandwich with melted cheese on soft white bread.", "photo-1528735602780-2552fd46c7af"),
  sandwich("White Jubbo Chicken Sandwich", 120, "Jumbo chicken sandwich — extra filling, extra flavour.", "photo-1553909489-cd47e0907980"),
  sandwich("Chicken Schezwon Sandwich", 100, "Spicy schezwan chicken sandwich.", "photo-1553909489-cd47e0907980"),
  sandwich("Chicken Sch. Cheese Sandwich", 120, "Schezwan chicken sandwich with melted cheese.", "photo-1528735602780-2552fd46c7af"),
  sandwich("Chicken Egg Sandwich", 120, "Chicken and egg sandwich — a protein-packed meal.", "photo-1553909489-cd47e0907980"),
  sandwich("Chicken Egg Ch. Sandwich", 140, "Chicken and egg sandwich loaded with cheese.", "photo-1528735602780-2552fd46c7af"),
  sandwich("Veg Sandwich", 80, "Classic vegetable sandwich with fresh fillings.", "photo-1529006557810-274b9b2fc783", true),
  sandwich("Veg Schezwan Sandwich", 100, "Spicy schezwan vegetable sandwich.", "photo-1529006557810-274b9b2fc783", true),
  sandwich("Veg Cheese Schezwan Sandwich", 120, "Veg sandwich with cheese and schezwan spice.", "photo-1529006557810-274b9b2fc783", true),
  sandwich("Veg Cheese Sandwich", 100, "Vegetable sandwich loaded with melted cheese.", "photo-1529006557810-274b9b2fc783", true),
  sandwich("Paneer Sandwich", 150, "Soft paneer filling in a classic sandwich.", "photo-1631452180519-c014fe946bc7", true),
  sandwich("Paneer Ch. Sandwich", 150, "Paneer sandwich loaded with cheese.", "photo-1631452180519-c014fe946bc7", true),
  sandwich("Paneer Ch. Schez Sandwich", 170, "Paneer sandwich with cheese and schezwan spice.", "photo-1631452180519-c014fe946bc7", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Burger
  // ═══════════════════════════════════════════════════════════════════
  burger("Chicken Burger", 80, "Crispy chicken fillet in a soft toasted bun.", "photo-1568901346375-23c9450c58cd"),
  burger("Chicken Cheese Burger", 100, "Crispy chicken burger loaded with melted cheese.", "photo-1550547660-d9450f859349", { isPopular: true }),
  burger("Schezwan Chicken Burger", 90, "Spicy schezwan chicken burger with bold flavours.", "photo-1568901346375-23c9450c58cd"),
  burger("Grilled Chicken Burger", 90, "Char-grilled chicken patty with fresh toppings.", "photo-1571091718767-18b5b1457add"),
  burger("Chicken Egg Burger", 130, "Chicken burger topped with a fried egg.", "photo-1568901346375-23c9450c58cd"),
  burger("Veg Burger", 80, "Classic vegetable burger with a crispy patty.", "photo-1550547660-d9450f859349", true),
  burger("Veg Schezwan Burger", 100, "Spicy schezwan vegetable burger.", "photo-1550547660-d9450f859349", true),
  burger("Veg Cheese Burger", 100, "Veggie burger loaded with melted cheese.", "photo-1550547660-d9450f859349", true),
  burger("Veg Cheese Schezwan Burger", 120, "Veg burger with cheese and schezwan spice.", "photo-1550547660-d9450f859349", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Pizza
  // ═══════════════════════════════════════════════════════════════════
  pizza("Chicken Pizza", 100, "Classic chicken pizza on a golden, crisp base.", "photo-1513104890138-7c749659a591"),
  pizza("Chicken Cheese Pizza", 130, "Chicken pizza loaded with melted cheese.", "photo-1565299624946-b28f40a0ae38", { isPopular: true }),
  pizza("Chicken Double che. Pizza",  150, "Double cheese chicken pizza — extra cheesy, extra delicious.", "photo-1574071318508-1cdbab80d002"),
  pizza("Paneer Pizza", 130, "Soft paneer toppings on a classic pizza base.", "photo-1628840042765-356cda07504e", true),
  pizza("Tomato Cheese Pizza", 100, "Fresh tomato and cheese pizza — simple and tasty.", "photo-1513104890138-7c749659a591", true),
  pizza("Capycum Cheese Pizza", 100, "Capsicum and cheese pizza with a golden base.", "photo-1513104890138-7c749659a591", true),
  pizza("Onion Cheese Pizza", 100, "Caramelised onion and cheese pizza.", "photo-1513104890138-7c749659a591", true),
  pizza("Margherita Pizza", 100, "Classic margherita with rich tomato sauce and cheese.", "photo-1513104890138-7c749659a591", true),
  pizza("Corn Pizza", 100, "Sweet corn and cheese pizza.", "photo-1513104890138-7c749659a591", true),
  pizza("Veg Pizza", 100, "Mixed vegetable pizza loaded with fresh toppings.", "photo-1513104890138-7c749659a591", true),
  pizza("Veg Cheese Pizza", 120, "Veggie pizza with extra melted cheese.", "photo-1565299624946-b28f40a0ae38", true),
  pizza("Veg Schezwon Pizza", 120, "Spicy schezwan vegetable pizza.", "photo-1513104890138-7c749659a591", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Chicken (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Chicken Noodles", 100, 140, "Classic chicken noodles.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Chicken Hakka Noodles", 100, 140, "Spicy hakka-style chicken noodles.", "photo-1585032226651-759b368d7246", false),
  hFItem("Chinese (H/F)", "Chicken Crispy Noodles", 110, 150, "Crispy chicken noodles with bold flavours.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Chicken Soya Chilly", 100, 140, "Chicken and soya in spicy chilli sauce.", "photo-1625398407796-82650a8c135f", false),
  hFItem("Chinese (H/F)", "Chicken Dragon Potato Chilly", 100, 140, "Dragon potato chilli with tender chicken.", "photo-1625398407796-82650a8c135f", false),
  hFItem("Chinese (H/F)", "Chicken Fried Rice", 100, 160, "Aromatic chicken fried rice.", "photo-1603133872878-684f208fb84b", false),
  hFItem("Chinese (H/F)", "Chicken Schezwan Fried Rice", 120, 170, "Spicy schezwan chicken fried rice.", "photo-1512058564366-18510be2db19", false),
  hFItem("Chinese (H/F)", "Chicken Manchurian", 120, 160, "Chicken manchurian in rich gravy.", "photo-1603133872878-684f208fb84b", false),
  hFItem("Chinese (H/F)", "Chicken Mixed Combi", 120, 180, "Mixed chicken combination — a hearty feast.", "photo-1603133872878-684f208fb84b", false),
  hFItem("Chinese (H/F)", "Chicken Chilli Garlic Noodles", 110, 160, "Chilli garlic chicken noodles — bold and flavourful.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Chicken White Sauce Pasta", 200, 320, "Creamy white sauce pasta with chicken.", "photo-1563379926898-05f4575a45d8", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Egg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Egg Noodles", 60, 90, "Classic egg noodles.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Egg Schezwan Noodles", 70, 100, "Spicy schezwan egg noodles.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Egg Hakka Noodles", 70, 100, "Hakka-style egg noodles.", "photo-1585032226651-759b368d7246", false),
  hFItem("Chinese (H/F)", "Egg Crispy Noodles", 70, 100, "Crispy egg noodles.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Egg Manchurian Noodles", 70, 100, "Egg noodles tossed in manchurian sauce.", "photo-1569718212165-3a8278d5f624", false),
  hFItem("Chinese (H/F)", "Egg Fried Rice", 60, 90, "Classic egg fried rice.", "photo-1603133872878-684f208fb84b", false),
  hFItem("Chinese (H/F)", "Egg Schezwan Fried Rice", 70, 100, "Spicy schezwan egg fried rice.", "photo-1512058564366-18510be2db19", false),
  hFItem("Chinese (H/F)", "Egg Manchurian Fried Rice", 70, 100, "Egg fried rice with manchurian flavour.", "photo-1603133872878-684f208fb84b", false),
  hFItem("Chinese (H/F)", "Egg Dry Manchurian", 80, 110, "Dry egg manchurian — bold and spicy.", "photo-1625398407796-82650a8c135f", false),
  hFItem("Chinese (H/F)", "Egg Soya Chilly", 70, 100, "Egg and soya in spicy chilli sauce.", "photo-1625398407796-82650a8c135f", false),
  hFItem("Chinese (H/F)", "Egg Pasta (Macaroni)", 70, 100, "Egg pasta (macaroni) in a flavourful sauce.", "photo-1563379926898-05f4575a45d8", false),
  hFItem("Chinese (H/F)", "Egg Dragon Potato Chilly", 80, 110, "Dragon potato chilli with egg.", "photo-1625398407796-82650a8c135f", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Veg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Noodles", 40, 60, "Classic plain noodles.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Hakka Noodles", 50, 90, "Spicy hakka-style noodles.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Schezwan Noodles", 60, 90, "Fiery schezwan noodles.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Crispy Noodles", 60, 90, "Crispy noodles with bold flavour.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Manchurian Noodles", 60, 90, "Noodles tossed in manchurian sauce.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Fried Rice", 40, 60, "Classic vegetable fried rice.", "photo-1603133872878-684f208fb84b", true),
  hFItem("Chinese (H/F)", "Schezwan Fried Rice", 60, 90, "Spicy schezwan vegetable fried rice.", "photo-1603133872878-684f208fb84b", true),
  hFItem("Chinese (H/F)", "Manchurian Fried Rice", 60, 90, "Vegetable fried rice with manchurian flavour.", "photo-1603133872878-684f208fb84b", true),
  hFItem("Chinese (H/F)", "Dry Manchurian", 50, 70, "Dry vegetable manchurian — spicy and crispy.", "photo-1603133872878-684f208fb84b", true),
  hFItem("Chinese (H/F)", "Gravy Manchurian", 50, 70, "Vegetable manchurian in rich gravy.", "photo-1625398407796-82650a8c135f", true),
  hFItem("Chinese (H/F)", "Mixed Combo", 70, 100, "Mixed vegetable combination — a hearty meal.", "photo-1603133872878-684f208fb84b", true),
  hFItem("Chinese (H/F)", "Soya Chilly", 40, 60, "Soya chunks in spicy chilli sauce.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Dragon Potato Chilly", 60, 90, "Dragon potato chilli — bold and spicy.", "photo-1569718212165-3a8278d5f624", true),
  hFItem("Chinese (H/F)", "Pasta/Macaroni", 40, 60, "Classic pasta/macaroni.", "photo-1563379926898-05f4575a45d8", true),
  hFItem("Chinese (H/F)", "White Sauce Pasta", 80, 150, "Creamy white sauce vegetable pasta.", "photo-1563379926898-05f4575a45d8", true),
  hFItem("Chinese (H/F)", "Veg Cheese Pasta", 80, 150, "Vegetable pasta loaded with cheese.", "photo-1563379926898-05f4575a45d8", true),
  snack("Veg Fried Momos", 80, "Crispy fried vegetable momos with spicy sauce.", "photo-1529692236671-f1f6cf9683ba", true),
  snack("Veg Chilly Fried Momos", 110, "Veg momos tossed in spicy chilli sauce.", "photo-1529692236671-f1f6cf9683ba", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Rolls
  // ═══════════════════════════════════════════════════════════════════
  roll("Single Egg Vegetable Roll", 40, "Single egg vegetable roll — light and tasty.", "photo-1626700051175-6818013e1d4f", true),
  roll("Double Egg Vegetable Roll", 50, "Double egg vegetable roll — protein-packed.", "photo-1626700051175-6818013e1d4f", true),
  roll("Single Chowmein Roll", 50, "Chowmein wrapped in a soft roll.", "photo-1606755962773-d324e0a13086", true),
  roll("Double Chowmein Roll", 60, "Double chowmein roll — extra filling, extra flavour.", "photo-1606755962773-d324e0a13086", true),
  roll("Single Combo Roll", 70, "Single combo roll with mixed fillings.", "photo-1606755962773-d324e0a13086"),
  roll("Double Combo Roll", 80, "Double combo roll — a hearty handful.", "photo-1606755962773-d324e0a13086"),
  roll("Single Paneer Roll", 120, "Soft paneer wrapped in a flavourful roll.", "photo-1631452180519-c014fe946bc7", true),
  roll("Double Paneer Roll", 130, "Double paneer roll — extra paneer, extra cheese.", "photo-1631452180519-c014fe946bc7", true),
  roll("Single Chicken Roll", 110, "Juicy chicken wrapped in a classic roll.", "photo-1606755962773-d324e0a13086"),
  roll("Double Chicken Roll", 120, "Double chicken roll — a proper feast.", "photo-1606755962773-d324e0a13086"),
  roll("Single Dragon Potato Roll", 60, "Dragon potato roll with bold flavours.", "photo-1606755962773-d324e0a13086", true),
  roll("Double Dragon Potato Roll", 70, "Double dragon potato roll — extra crispy.", "photo-1606755962773-d324e0a13086", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Soup
  // ═══════════════════════════════════════════════════════════════════
  soup("Tomato Soup", 60, "Classic tomato soup — warm and comforting.", "photo-1547592166-23ac45744acd"),
  soup("Veg Manchau Soup", 60, "Spicy manchau soup with mixed vegetables.", "photo-1607330289024-1535c6b4e1c1"),
  soup("Veg Sweet Corn Soup", 70, "Sweet corn soup with a hint of pepper.", "photo-1547592180-85f173990554"),
  soup("Veg Garlic Soup", 60, "Aromatic garlic soup with fresh herbs.", "photo-1547592166-23ac45744acd"),
  soup("Veg Manchurian Soup", 60, "Manchurian soup — bold, spicy and warming.", "photo-1607330289024-1535c6b4e1c1"),
  soup("Chicken Soup", 80, "Classic chicken soup — warm and satisfying.", "photo-1607330289024-1535c6b4e1c1", false),
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
