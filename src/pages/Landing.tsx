import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { MenuItem } from "@/data/menu";
import { Navbar } from "@/components/restaurant/Navbar";
import { Hero } from "@/components/restaurant/Hero";
import { Marquee } from "@/components/restaurant/Marquee";
import { QuickActions } from "@/components/restaurant/QuickActions";
import { FeaturedFood } from "@/components/restaurant/FeaturedFood";
import { MenuSection } from "@/components/restaurant/MenuSection";
import { ItemDialog } from "@/components/restaurant/ItemDialog";
import { CartDrawer } from "@/components/restaurant/CartDrawer";
import { Offers } from "@/components/restaurant/Offers";
import { FoodStory } from "@/components/restaurant/FoodStory";
import { FoodPreparation } from "@/components/restaurant/FoodPreparation";
import { RestaurantSection } from "@/components/restaurant/RestaurantSection";
import { InstagramGallery } from "@/components/restaurant/InstagramGallery";
import { SocialProof } from "@/components/restaurant/SocialProof";
import { ContactSection } from "@/components/restaurant/ContactSection";
import { Footer } from "@/components/restaurant/Footer";
import { MobileOrderBar } from "@/components/restaurant/MobileOrderBar";

function Site() {
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground"
    >
      <Navbar />

      <main>
        <Hero />
        <Marquee />
        <QuickActions />
        <FeaturedFood onOpen={setActiveItem} />
        <MenuSection onOpen={setActiveItem} />
        <Offers />
        <FoodStory />
        <FoodPreparation />
        <RestaurantSection />
        <InstagramGallery />
        <SocialProof />
        <ContactSection />
      </main>

      <Footer />

      <ItemDialog item={activeItem} onClose={() => setActiveItem(null)} />
      <CartDrawer />
      <MobileOrderBar />
    </motion.div>
  );
}

export default function Landing() {
  // Imports the starter menu into the products table once, so in-app
  // ordering (and the admin panel) have real prices to work with.
  const seed = useMutation(api.products.ensureSeeded);
  useEffect(() => {
    seed().catch(() => {});
  }, [seed]);

  return <Site />;
}
