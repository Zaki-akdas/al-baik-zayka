/**
 * Visual content data — editable placeholders.
 *
 * - `instagramPosts`: gallery tiles. Swap in the business's own posts/reels
 *   (images + optional videoUrl). Each tile links to the Instagram profile.
 * - `prepSteps`: "Made fresh. Served hot." section. Each step supports an
 *   optional `videoUrl` (vertical reel); when absent, the image is shown.
 * - `interiorShots`: restaurant interior photos for the "Come visit us" section.
 */

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

export interface GalleryItem {
  id: string;
  image: string;
  alt: string;
  /** Mark reel-style posts; renders a play badge overlay. */
  isReel?: boolean;
  /** Optional vertical video; falls back to the poster image. */
  videoUrl?: string;
}

export const instagramPosts: GalleryItem[] = [
  {
    id: "post-1",
    image: img("photo-1568901346375-23c9450c58cd"),
    alt: "Al-Baik Zayka signature burger",
    isReel: true,
  },
  {
    id: "post-2",
    image: img("photo-1529006557810-274b9b2fc783"),
    alt: "Al-Baik Zayka chicken shawarma",
  },
  {
    id: "post-3",
    image: img("photo-1513104890138-7c749659a591"),
    alt: "Al-Baik Zayka pizza",
  },
  {
    id: "post-4",
    image: img("photo-1573080496219-bb080dd4f877"),
    alt: "Al-Baik Zayka loaded fries",
    isReel: true,
  },
  {
    id: "post-5",
    image: img("photo-1562967914-608f82629710"),
    alt: "Al-Baik Zayka fried chicken combo",
  },
  {
    id: "post-6",
    image: img("photo-1551024709-8f23befc6f87"),
    alt: "Al-Baik Zayka milkshake",
  },
];

export interface PrepStep {
  id: string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
}

export const prepSteps: PrepStep[] = [
  {
    id: "step-1",
    title: "Wrap Preparation",
    description: "Soft, fresh wraps laid out and loaded by hand.",
    image: img("photo-1626700051175-6818013e1d4f", 800),
  },
  {
    id: "step-2",
    title: "Sauce Application",
    description: "Our signature zayka sauces, applied generously.",
    image: img("photo-1540189549336-e6e99c3679fe", 800),
  },
  {
    id: "step-3",
    title: "Food Assembly",
    description: "Every layer stacked fresh, right before serving.",
    image: img("photo-1606755962773-d324e0a13086", 800),
  },
  {
    id: "step-4",
    title: "Grilling & Cooking",
    description: "Hot grills, char and smoke — cooked to order.",
    image: img("photo-1555939594-58d7cb561ad1", 800),
  },
  {
    id: "step-5",
    title: "Final Serving",
    description: "Packed hot and handed over, or delivered to your door.",
    image: img("photo-1594212699903-ec8a3eca50f5", 800),
  },
];

export interface InteriorShot {
  id: string;
  image: string;
  alt: string;
}

export const interiorShots: InteriorShot[] = [
  {
    id: "interior-1",
    image: img("photo-1517248135467-4c7edcad34c4", 1000),
    alt: "Inside Al-Baik Zayka restaurant",
  },
  {
    id: "interior-2",
    image: img("photo-1552566626-52f8b828add9", 800),
    alt: "Al-Baik Zayka seating area",
  },
  {
    id: "interior-3",
    image: img("photo-1559339352-11d035aa65de", 800),
    alt: "Al-Baik Zayka food counter",
  },
];
