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
  // ABZ Specials
  jumboTwister: "photo-1626700051175-6818013e1d4f",
  specialShawarma: "photo-1529006557810-274b9b2fc783",
  kingBurger: "photo-1568901346375-23c9450c58cd",
  jumboSandwich: "photo-1553909489-cd47e0907980",
  loadedSandwich: "photo-1528735602780-2552fd46c7af",
  lodedPizza: "photo-1565299624946-b28f40a0ae38",
  cheesePizza: "photo-1513104890138-7c749659a591",
  chickenTocco: "photo-1551218808-94e220e084d2",
  // Cold Coffee & Drinks
  coldCoffee: "photo-1461023058943-07fcbe16d735",
  thickShake: "photo-1572490122747-3968b75cc699",
  iceCreamShake: "photo-1579954115545-a95591f28bfc",
  kitkatShake: "photo-1563805042-7684c019e1cb",
  mojito: "photo-1513558161293-cdaf765ed2fd",
  chocoCake: "photo-1578985545062-69928b1d9587",
  // Maggi
  plainMaggi: "photo-1612929633738-8fe44f7ec841",
  vegMaggi: "photo-1585032226651-759b368d7246",
  chickenMaggi: "photo-1569718212165-3a8278d5f624",
  // Snacks & Fries
  popcorn: "photo-1573080496219-bb080dd4f877",
  boneless: "photo-1562967914-608f82629710",
  hotWings: "photo-1567620832903-9fc6debc209f",
  lollipop: "photo-1544025162-d76694265947",
  nuggets: "photo-1562967914-608f82629710",
  fries: "photo-1573080496219-bb080dd4f877",
  periFries: "photo-1585109649139-366815a0d713",
  momos: "photo-1529692236671-f1f6cf9683ba",
  // Tacco
  taco: "photo-1551218808-94e220e084d2",
  cheeseTaco: "photo-1565299624946-b28f40a0ae38",
  cornTaco: "photo-1552332386-f8dd00dc2f85",
  // Loaded
  loaded: "photo-1585109649139-366815a0d713",
  chickenLoaded: "photo-1585109649139-366815a0d713",
  // Twister Rolls
  wrap: "photo-1606755962773-d324e0a13086",
  eggWrap: "photo-1626700051175-6818013e1d4f",
  vegWrap: "photo-1529006557810-274b9b2fc783",
  // Sandwich
  chickenSandwich: "photo-1553909489-cd47e0907980",
  cheeseSandwich: "photo-1528735602780-2552fd46c7af",
  paneerSandwich: "photo-1631452180519-c014fe946bc7",
  // Burger
  chickenBurger: "photo-1568901346375-23c9450c58cd",
  cheeseBurger: "photo-1550547660-d9450f859349",
  grilledBurger: "photo-1571091718767-18b5b1457add",
  vegBurger: "photo-1550547660-d9450f859349",
  // Pizza
  chickenPizza: "photo-1513104890138-7c749659a591",
  cheesePizzaImg: "photo-1565299624946-b28f40a0ae38",
  doubleCheesePizza: "photo-1574071318508-1cdbab80d002",
  paneerPizza: "photo-1628840042765-356cda07504e",
  vegPizza: "photo-1513104890138-7c749659a591",
  // Chinese (H/F)
  noodles: "photo-1569718212165-3a8278d5f624",
  hakkaNoodles: "photo-1585032226651-759b368d7246",
  friedRice: "photo-1603133872878-684f208fb84b",
  schezwanRice: "photo-1512058564366-18510be2db19",
  manchurian: "photo-1625398407796-82650a8c135f",
  pasta: "photo-1563379926898-05f4575a45d8",
  whitePasta: "photo-1621996346565-e3dbc646d9a9",
  // Rolls
  eggRoll: "photo-1626700051175-6818013e1d4f",
  chickenRoll: "photo-1606755962773-d324e0a13086",
  paneerRoll: "photo-1631452180519-c014fe946bc7",
  chowmeinRoll: "photo-1569718212165-3a8278d5f624",
  // Soup
  tomatoSoup: "photo-1547592166-23ac45744acd",
  manchauSoup: "photo-1607330289024-1535c6b4e1c1",
  cornSoup: "photo-1547592180-85f173990554",
  garlicSoup: "photo-1603133872878-684f208fb84b",
  chickenSoup: "photo-1607330289024-1535c6b4e1c1",
} as const;

export const menuItems: MenuItem[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  ABZ Specials
  // ═══════════════════════════════════════════════════════════════════
  specials("ABZ Special Chicken Jumbo Twister", "Our signature jumbo twister loaded with special chicken filling and house sauces.", 150, "/Max_a_ABZ_Special_Chi._Jum.png", { isPopular: true }),
  specials("ABZ Special Chicken Jumbo Shawarma", "Juicy jumbo shawarma packed with special chicken and zayka sauces.", 140, "/Max_a_ABZ_Special_Chicken_.png", { isPopular: true }),
  specials("ABZ Special Chicken King Burger", "A towering king burger with our special chicken patty and bold flavours.", 130, "/Max_a_ABZ_Special_Chicken_ (1).png", { isPopular: true }),
  specials("ABZ Special Chi. Jumbo Sandwich", "Jumbo sandwich overflowing with special chicken and signature fillings.", 140, "/Max_a_ABZ_Special_Chicken_ (2).png"),
  specials("ABZ Special Loded King Jumbo Sandwich", "A loaded king jumbo sandwich packed with chicken, cheese and sauces.", 200, "/mai-image-2.5 (text-to-image)_a_ABZ_Special_Loded_Ki.png"),
  specials("ABZ Special Chicken Chesse Loded Pizza", "Loaded cheese pizza topped with special chicken and extra cheese.", 250, "/Max_a_ABZ_Special_Chicken_ (3).png"),
  specials("ABZ Special Chicken Chesse Pizza", "Classic cheese pizza with our special chicken topping.", 200, "/Max_a_ABZ_Special_Chicken_ (4).png"),
  specials("ABZ Special Chicken Tocco", "Crispy chicken tocco with our signature spice blend.", 150, "/Max_a_Here_are_the_details.png"),

  // ═══════════════════════════════════════════════════════════════════
  //  Cold Coffee
  // ═══════════════════════════════════════════════════════════════════
  coldCoffee("Cold Coffee", 70, "/Max_a_Cold_Coffee_-_70_gen.png"),
  coldCoffee("Cold Coffee Thick Shake", 80, "/Max_a_Cold_Coffee_Thick_Sh.png"),
  coldCoffee("Cold Coffee Thick Shake With Ice Cream", 100, "/Max_a_Cold_Coffee_Thick_Sh (1).png"),
  coldCoffee("Kitkat Shake", 100, "/Max_a_KitKat_Shake_-_100_g.png", { isPopular: true }),

  // ═══════════════════════════════════════════════════════════════════
  //  Beverages & Desserts
  // ═══════════════════════════════════════════════════════════════════
  bevDessert("Mojito", 80, "Refreshing mojito — cool, fizzy and full of flavour.", "/Max_a_Cold_Coffee_-_70_gen.png"),
  bevDessert("Choco Lawa Cake", 80, "Rich chocolate lava cake — warm, gooey and irresistible.", "/Max_a_Choco_Lawa_Cake_80_-.png", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Maggi
  // ═══════════════════════════════════════════════════════════════════
  maggi("Plain Maggi", 60, "Classic plain Maggi — simple and satisfying.", "/Max_a_Plain_Maggi_-_60_gen.png"),
  maggi("Veg Maggi", 80, "Maggi loaded with fresh vegetables.", "/Max_a_Veg_Maggi_-_80_gener.png"),
  maggi("Veg Che Maggi", 120, "Vegetable Maggi topped with melted cheese.", "/Max_a_Veg_Che_Maggi_-_120_.png"),
  maggi("Chicken Maggi", 120, "Maggi tossed with tender chicken pieces.", "/Max_a_Chicken_Maggi_-_120_.png", false),
  maggi("Chicken che. Maggi", 150, "Chicken Maggi loaded with melted cheese.", "/Max_a_Chicken_che._Maggi_-.png", false),

  // ═══════════════════════════════════════════════════════════════════
  //  Snacks & Fries
  // ═══════════════════════════════════════════════════════════════════
  snack("Chicken Popcorn", 80, "Bite-sized crispy chicken popcorn — crunchy and addictive.", "/Max_a_Chicken_Nuggets_10_P.png"),
  snack("Chicken Boneless", 100, "Juicy boneless chicken pieces, perfectly fried.", "/Max_a_cocked_Chicken_Bonel.png"),
  snack("Chicken Hot Wings 4pcs", 80, "Fiery hot chicken wings — crispy on the outside, juicy inside.", "/Max_a_Chicken_Hot_Wings_4p.png"),
  snack("Chicken Lollipop 4pcs", 100, "Succulent chicken lollipops with a spicy glaze.", "/Max_a_Chicken_Lollipop_4pc.png"),
  snack("Chicken Nuggets 10 Pcs", 120, "Golden crispy chicken nuggets — a crowd favourite.", "/Max_a_Chicken_Nuggets_10_P.png"),
  snack("French Fries Salted", 70, "Crispy golden fries, lightly salted.", "/Max_a_French_Fries_Salted_.png", true),
  snack("Chet Masala Fries", 80, "Fries tossed in tangy chaat masala spice.", "/a_Chet_Masala_Fries_-_.png", true),
  snack("Peri Peri Fries", 80, "Golden fries tossed in fiery peri peri spice.", "/Max_a_Peri_Peri_Fries_-_80.png", true, { isPopular: true }),
  snack("VEG FRY MOMO's", 80, "Crispy fried vegetable momos with spicy dipping sauce.", "/Max_a_VEG_FRY_MOMO'S_-_80_.png", true),

  // ═══════════════════════════════════════════════════════════════════
  //  Tacco
  // ═══════════════════════════════════════════════════════════════════
  tacco("Chicken Crunchy Tacco", 120, "Crunchy chicken taco with fresh toppings.", "/Max_a_Chicken_Crunchy_Tacc.png"),
  tacco("Chicken Crunchy Cheese Tacco", 130, "Crunchy chicken taco loaded with melted cheese.", "/Max_a_Chicken_Crunchy_Corn.png"),
  tacco("Chicken Crunchy Corn Cheese Tacco", 130, "Crunchy taco with chicken, corn and cheese.", "/Max_a_Chicken_Crunchy_Corn (1).png"),
  tacco("Chicken Crunchy Corn Cheese Double Tacco", 140, "Double-layered crunchy taco with chicken, corn and cheese.", "/Max_a_Chicken_Crunchy_Corn (1).png"),

  // ═══════════════════════════════════════════════════════════════════
  //  Loaded
  // ═══════════════════════════════════════════════════════════════════
  loaded("Mini Loaded", 100, "Mini loaded fries with cheese, sauces and toppings.", "/Max_a_Peri_Peri_Fries_-_80.png", true),
  loaded("Loaded", 150, "Fully loaded fries with cheese, sauces and generous toppings.", I.loaded, true, { isPopular: true }),
  loaded("Only Chicken Loaded", 200, "Loaded fries topped with extra chicken, cheese and zayka sauces.", "/Max_a_Only_Chicken_Loaded_.png"),

  // ═══════════════════════════════════════════════════════════════════
  //  Twister Rolls
  // ═══════════════════════════════════════════════════════════════════
  twister("Chicken Twister", 90, "Classic chicken twister — juicy chicken wrapped tight.", "/Max_a_Chicken_Twister_-_90.png"),
  twister("Chicken Cheese Twister", 100, "Chicken twister loaded with melted cheese.", "/a_Chicken_Cheese_Twist.png"),
  twister("Schezwan Chicken Twister", 100, "Spicy schezwan chicken twister with bold flavours.", "/a_Schezwan_Chicken_Twi.png"),
  twister("Chicken Sch. Egg Roll Twister", 150, "Schezwan egg roll twister loaded with chicken.", "/a_Chicken_Sch._Egg_Rol.png"),
  twister("Chicken Egg Roll Twister", 150, "Chicken and egg roll twister — a hearty classic.", "/a_Chicken_Egg_Roll_Twi.png"),
  twister("Chi. Ch. Sch. Egg Roll Twister", 160, "Loaded chicken, schezwan and egg roll twister.", "/a_Chicken_Egg_Roll_Twi.png"),
  twister("Veg Twister", 80, "Fresh veggie twister with crunchy vegetables.", I.vegWrap, true),
  twister("Veg Cheese Twister", 100, "Veggie twister topped with melted cheese.", I.vegWrap, true),
  twister("Veg Schezwan Twister", 100, "Spicy schezwan veggie twister.", I.vegWrap, true),
  twister("Veg Cheese Sch. Twister", 120, "Veggie twister with cheese and schezwan spice.", I.vegWrap, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Sandwich
  // ═══════════════════════════════════════════════════════════════════
  sandwich("White Chicken Sandwich", 80, "Classic white bread sandwich with tender chicken filling.", I.chickenSandwich),
  sandwich("White Chicken Cheese Sandwich", 100, "Chicken sandwich with melted cheese on soft white bread.", I.cheeseSandwich),
  sandwich("White Jubbo Chicken Sandwich", 120, "Jumbo chicken sandwich — extra filling, extra flavour.", I.chickenSandwich),
  sandwich("Chicken Schezwon Sandwich", 100, "Spicy schezwan chicken sandwich.", I.chickenSandwich),
  sandwich("Chicken Sch. Cheese Sandwich", 120, "Schezwan chicken sandwich with melted cheese.", I.cheeseSandwich),
  sandwich("Chicken Egg Sandwich", 120, "Chicken and egg sandwich — a protein-packed meal.", I.chickenSandwich),
  sandwich("Chicken Egg Ch. Sandwich", 140, "Chicken and egg sandwich loaded with cheese.", I.cheeseSandwich),
  sandwich("Veg Sandwich", 80, "Classic vegetable sandwich with fresh fillings.", I.vegWrap, true),
  sandwich("Veg Schezwan Sandwich", 100, "Spicy schezwan vegetable sandwich.", I.vegWrap, true),
  sandwich("Veg Cheese Schezwan Sandwich", 120, "Veg sandwich with cheese and schezwan spice.", I.vegWrap, true),
  sandwich("Veg Cheese Sandwich", 100, "Vegetable sandwich loaded with melted cheese.", I.vegWrap, true),
  sandwich("Paneer Sandwich", 150, "Soft paneer filling in a classic sandwich.", I.paneerSandwich, true),
  sandwich("Paneer Ch. Sandwich", 150, "Paneer sandwich loaded with cheese.", I.paneerSandwich, true),
  sandwich("Paneer Ch. Schez Sandwich", 170, "Paneer sandwich with cheese and schezwan spice.", I.paneerSandwich, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Burger
  // ═══════════════════════════════════════════════════════════════════
  burger("Chicken Burger", 80, "Crispy chicken fillet in a soft toasted bun.", I.chickenBurger),
  burger("Chicken Cheese Burger", 100, "Crispy chicken burger loaded with melted cheese.", I.cheeseBurger, { isPopular: true }),
  burger("Schezwan Chicken Burger", 90, "Spicy schezwan chicken burger with bold flavours.", I.chickenBurger),
  burger("Grilled Chicken Burger", 90, "Char-grilled chicken patty with fresh toppings.", I.grilledBurger),
  burger("Chicken Egg Burger", 130, "Chicken burger topped with a fried egg.", I.chickenBurger),
  burger("Veg Burger", 80, "Classic vegetable burger with a crispy patty.", I.vegBurger, true),
  burger("Veg Schezwan Burger", 100, "Spicy schezwan vegetable burger.", I.vegBurger, true),
  burger("Veg Cheese Burger", 100, "Veggie burger loaded with melted cheese.", I.vegBurger, true),
  burger("Veg Cheese Schezwan Burger", 120, "Veg burger with cheese and schezwan spice.", I.vegBurger, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Pizza
  // ═══════════════════════════════════════════════════════════════════
  pizza("Chicken Pizza", 100, "Classic chicken pizza on a golden, crisp base.", I.chickenPizza),
  pizza("Chicken Cheese Pizza", 130, "Chicken pizza loaded with melted cheese.", I.cheesePizzaImg, { isPopular: true }),
  pizza("Chicken Double che. Pizza",  150, "Double cheese chicken pizza — extra cheesy, extra delicious.", I.doubleCheesePizza),
  pizza("Paneer Pizza", 130, "Soft paneer toppings on a classic pizza base.", I.paneerPizza, true),
  pizza("Tomato Cheese Pizza", 100, "Fresh tomato and cheese pizza — simple and tasty.", I.vegPizza, true),
  pizza("Capycum Cheese Pizza", 100, "Capsicum and cheese pizza with a golden base.", I.vegPizza, true),
  pizza("Onion Cheese Pizza", 100, "Caramelised onion and cheese pizza.", I.vegPizza, true),
  pizza("Margherita Pizza", 100, "Classic margherita with rich tomato sauce and cheese.", I.chickenPizza, true),
  pizza("Corn Pizza", 100, "Sweet corn and cheese pizza.", I.vegPizza, true),
  pizza("Veg Pizza", 100, "Mixed vegetable pizza loaded with fresh toppings.", I.vegPizza, true),
  pizza("Veg Cheese Pizza", 120, "Veggie pizza with extra melted cheese.", I.cheesePizzaImg, true),
  pizza("Veg Schezwon Pizza", 120, "Spicy schezwan vegetable pizza.", I.vegPizza, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Chicken (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Chicken Noodles", 100, 140, "Classic chicken noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Hakka Noodles", 100, 140, "Spicy hakka-style chicken noodles.", I.hakkaNoodles, false),
  hFItem("Chinese (H/F)", "Chicken Crispy Noodles", 110, 150, "Crispy chicken noodles with bold flavours.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken Soya Chilly", 100, 140, "Chicken and soya in spicy chilli sauce.", I.manchurian, false),
  hFItem("Chinese (H/F)", "Chicken Dragon Potato Chilly", 100, 140, "Dragon potato chilli with tender chicken.", I.manchurian, false),
  hFItem("Chinese (H/F)", "Chicken Fried Rice", 100, 160, "Aromatic chicken fried rice.", I.friedRice, false),
  hFItem("Chinese (H/F)", "Chicken Schezwan Fried Rice", 120, 170, "Spicy schezwan chicken fried rice.", I.schezwanRice, false),
  hFItem("Chinese (H/F)", "Chicken Manchurian", 120, 160, "Chicken manchurian in rich gravy.", I.friedRice, false),
  hFItem("Chinese (H/F)", "Chicken Mixed Combi", 120, 180, "Mixed chicken combination — a hearty feast.", I.friedRice, false),
  hFItem("Chinese (H/F)", "Chicken Chilli Garlic Noodles", 110, 160, "Chilli garlic chicken noodles — bold and flavourful.", I.noodles, false),
  hFItem("Chinese (H/F)", "Chicken White Sauce Pasta", 200, 320, "Creamy white sauce pasta with chicken.", I.whitePasta, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Egg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Egg Noodles", 60, 90, "Classic egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Schezwan Noodles", 70, 100, "Spicy schezwan egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Hakka Noodles", 70, 100, "Hakka-style egg noodles.", I.hakkaNoodles, false),
  hFItem("Chinese (H/F)", "Egg Crispy Noodles", 70, 100, "Crispy egg noodles.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Manchurian Noodles", 70, 100, "Egg noodles tossed in manchurian sauce.", I.noodles, false),
  hFItem("Chinese (H/F)", "Egg Fried Rice", 60, 90, "Classic egg fried rice.", I.friedRice, false),
  hFItem("Chinese (H/F)", "Egg Schezwan Fried Rice", 70, 100, "Spicy schezwan egg fried rice.", I.schezwanRice, false),
  hFItem("Chinese (H/F)", "Egg Manchurian Fried Rice", 70, 100, "Egg fried rice with manchurian flavour.", I.friedRice, false),
  hFItem("Chinese (H/F)", "Egg Dry Manchurian", 80, 110, "Dry egg manchurian — bold and spicy.", I.manchurian, false),
  hFItem("Chinese (H/F)", "Egg Soya Chilly", 70, 100, "Egg and soya in spicy chilli sauce.", I.manchurian, false),
  hFItem("Chinese (H/F)", "Egg Pasta (Macaroni)", 70, 100, "Egg pasta (macaroni) in a flavourful sauce.", I.pasta, false),
  hFItem("Chinese (H/F)", "Egg Dragon Potato Chilly", 80, 110, "Dragon potato chilli with egg.", I.manchurian, false),

  // ═══════════════════════════════════════════════════════════════════
  //  Veg (H / F)
  // ═══════════════════════════════════════════════════════════════════
  hFItem("Chinese (H/F)", "Noodles", 40, 60, "Classic plain noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Hakka Noodles", 50, 90, "Spicy hakka-style noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Schezwan Noodles", 60, 90, "Fiery schezwan noodles.", I.noodles, true),
  hFItem("Chinese (H/F)", "Crispy Noodles", 60, 90, "Crispy noodles with bold flavour.", I.noodles, true),
  hFItem("Chinese (H/F)", "Manchurian Noodles", 60, 90, "Noodles tossed in manchurian sauce.", I.noodles, true),
  hFItem("Chinese (H/F)", "Fried Rice", 40, 60, "Classic vegetable fried rice.", I.friedRice, true),
  hFItem("Chinese (H/F)", "Schezwan Fried Rice", 60, 90, "Spicy schezwan vegetable fried rice.", I.friedRice, true),
  hFItem("Chinese (H/F)", "Manchurian Fried Rice", 60, 90, "Vegetable fried rice with manchurian flavour.", I.friedRice, true),
  hFItem("Chinese (H/F)", "Dry Manchurian", 50, 70, "Dry vegetable manchurian — spicy and crispy.", I.friedRice, true),
  hFItem("Chinese (H/F)", "Gravy Manchurian", 50, 70, "Vegetable manchurian in rich gravy.", I.manchurian, true),
  hFItem("Chinese (H/F)", "Mixed Combo", 70, 100, "Mixed vegetable combination — a hearty meal.", I.friedRice, true),
  hFItem("Chinese (H/F)", "Soya Chilly", 40, 60, "Soya chunks in spicy chilli sauce.", I.noodles, true),
  hFItem("Chinese (H/F)", "Dragon Potato Chilly", 60, 90, "Dragon potato chilli — bold and spicy.", I.noodles, true),
  hFItem("Chinese (H/F)", "Pasta/Macaroni", 40, 60, "Classic pasta/macaroni.", I.pasta, true),
  hFItem("Chinese (H/F)", "White Sauce Pasta", 80, 150, "Creamy white sauce vegetable pasta.", I.pasta, true),
  hFItem("Chinese (H/F)", "Veg Cheese Pasta", 80, 150, "Vegetable pasta loaded with cheese.", I.pasta, true),
  snack("Veg Fried Momos", 80, "Crispy fried vegetable momos with spicy sauce.", I.momos, true),
  snack("Veg Chilly Fried Momos", 110, "Veg momos tossed in spicy chilli sauce.", I.momos, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Rolls
  // ═══════════════════════════════════════════════════════════════════
  roll("Single Egg Vegetable Roll", 40, "Single egg vegetable roll — light and tasty.", I.eggRoll, true),
  roll("Double Egg Vegetable Roll", 50, "Double egg vegetable roll — protein-packed.", I.eggRoll, true),
  roll("Single Chowmein Roll", 50, "Chowmein wrapped in a soft roll.", I.chowmeinRoll, true),
  roll("Double Chowmein Roll", 60, "Double chowmein roll — extra filling, extra flavour.", I.chowmeinRoll, true),
  roll("Single Combo Roll", 70, "Single combo roll with mixed fillings.", I.chickenRoll),
  roll("Double Combo Roll", 80, "Double combo roll — a hearty handful.", I.chickenRoll),
  roll("Single Paneer Roll", 120, "Soft paneer wrapped in a flavourful roll.", I.paneerRoll, true),
  roll("Double Paneer Roll", 130, "Double paneer roll — extra paneer, extra cheese.", I.paneerRoll, true),
  roll("Single Chicken Roll", 110, "Juicy chicken wrapped in a classic roll.", I.chickenRoll),
  roll("Double Chicken Roll", 120, "Double chicken roll — a proper feast.", I.chickenRoll),
  roll("Single Dragon Potato Roll", 60, "Dragon potato roll with bold flavours.", I.chowmeinRoll, true),
  roll("Double Dragon Potato Roll", 70, "Double dragon potato roll — extra crispy.", I.chowmeinRoll, true),

  // ═══════════════════════════════════════════════════════════════════
  //  Soup
  // ═══════════════════════════════════════════════════════════════════
  soup("Tomato Soup", 60, "Classic tomato soup — warm and comforting.", I.tomatoSoup),
  soup("Veg Manchau Soup", 60, "Spicy manchau soup with mixed vegetables.", I.manchauSoup),
  soup("Veg Sweet Corn Soup", 70, "Sweet corn soup with a hint of pepper.", I.cornSoup),
  soup("Veg Garlic Soup", 60, "Aromatic garlic soup with fresh herbs.", I.garlicSoup),
  soup("Veg Manchurian Soup", 60, "Manchurian soup — bold, spicy and warming.", I.manchauSoup),
  soup("Chicken Soup", 80, "Classic chicken soup — warm and satisfying.", I.chickenSoup, false),
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
