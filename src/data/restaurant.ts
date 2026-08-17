/**
 * Al-Baik Zayka — editable site data.
 *
 * Everything business-specific lives here so menu items, prices, offers, images
 * and contact details can be updated without touching component code. Real
 * Instagram-derived content can replace the placeholders below (items with
 * `price: null` display "price to be updated" — no prices are invented).
 */

export interface RestaurantInfo {
  name: string;
  tagline: string;
  contactPerson: string;
  /** Display format, e.g. "8269516101" */
  phone: string;
  /** International format used for tel: and WhatsApp links */
  phoneIntl: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  deliveryAvailable: boolean;
  /** Upload the real logo here (e.g. "/logo-albaik.png"). Falls back to the built-in badge. */
  logoUrl: string | null;
  address: {
    landmark: string;
    street: string;
    nearby: string;
  };
  /**
   * Google Maps link. Leave empty to use an honest landmark search query;
   * replace with the exact pin once the location is confirmed.
   */
  mapsUrl: string;
}

export const restaurant: RestaurantInfo = {
  name: "Al-Baik Zayka",
  tagline: "Fast Food • Home Delivery • Affordable Combos",
  contactPerson: "Aamir Zama",
  phone: "8269516101",
  phoneIntl: "+918269516101",
  whatsappNumber: "918269516101",
  instagramHandle: "@albaik_zayka",
  instagramUrl: "https://www.instagram.com/albaik_zayka/",
  deliveryAvailable: true,
  logoUrl: null,
  address: {
    landmark: "Rajdhani Petrol Pump",
    street: "Baba Fareed Gali",
    nearby: "Near Sheikh Saab Masjid",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rajdhani+Petrol+Pump+Baba+Fareed+Gali",
};

export const addressLine = [
  restaurant.address.landmark,
  restaurant.address.street,
  restaurant.address.nearby,
].join(", ");

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Offers", href: "#offers" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "Contact", href: "#contact" },
] as const;

/** Trust elements — only verified facts (no invented claims). */
export const trustItems = [
  {
    title: "Home Delivery",
    detail: "Available",
    icon: "truck",
  },
  {
    title: "Affordable Combos",
    detail: "Check our combo section",
    icon: "sparkles",
  },
  {
    title: "Order Direct",
    detail: "Call or WhatsApp the restaurant",
    icon: "phone",
  },
] as const;
