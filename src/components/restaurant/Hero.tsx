import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { restaurant } from "@/data/restaurant";
import { telLink } from "@/lib/whatsapp";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const reduce = useReducedMotion();

  const scrollToMenu = () =>
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-32 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-gold/25 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-12%] h-[28rem] w-[28rem] rounded-full bg-maroon/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(101,21,27,0.05),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.div variants={item}>
            <Badge
              variant="outline"
              className="border-maroon/30 bg-white/60 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-maroon"
            >
              WELCOME TO AL-BAIK ZAYKA
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-4 font-display text-5xl uppercase leading-[0.92] tracking-tight text-foreground text-balance sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Big Flavour.
            <br />
            Real{" "}
            <span className="font-script font-bold normal-case text-maroon">
              Zayka
            </span>
            .
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Fast Food • Affordable Combos • Home Delivery
          </motion.p>

          <motion.p
            variants={item}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Craving something delicious? Discover freshly prepared fast food,
            tasty combos and everyday favourites from Al-Baik Zayka.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <Button
              size="lg"
              className="group h-11 px-5 text-sm sm:h-12 sm:px-7 sm:text-base"
              onClick={scrollToMenu}
            >
              Order Now
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 bg-white/70 px-5 text-sm backdrop-blur-sm sm:h-12 sm:px-7 sm:text-base"
              onClick={scrollToMenu}
            >
              View Menu
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm"
          >
            <a
              href={telLink}
              className="inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-maroon"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-maroon/10 text-maroon">
                <Phone className="size-4" />
              </span>
              Call: {restaurant.phone}
            </a>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Truck className="size-4 text-gold" />
              Home delivery available
            </span>
          </motion.div>
        </motion.div>

        {/* Food photography */}
        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-lg lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl shadow-maroon/20">
            <img
              src={img("photo-1568901346375-23c9450c58cd")}
              alt="Al-Baik Zayka signature burger"
              width={1200}
              height={900}
              fetchPriority="high"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maroon/35 via-transparent to-transparent" />
          </div>

          {/* Floating delivery badge */}
          <div className="animate-float absolute -top-4 right-2 hidden items-center gap-2 rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-lg shadow-maroon/10 backdrop-blur-sm sm:flex sm:-right-6">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold/20 text-maroon">
              <Truck className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-foreground">
                Home Delivery
              </span>
              <span className="block text-xs text-muted-foreground">
                Available
              </span>
            </span>
          </div>

          {/* Floating combo badge */}
          <div className="animate-float-delayed absolute -bottom-5 left-2 hidden rounded-2xl border border-border bg-white/95 px-4 py-3 shadow-lg shadow-maroon/10 backdrop-blur-sm sm:block sm:-left-6">
            <span className="block font-display text-2xl uppercase leading-none text-maroon">
              Combo
            </span>
            <span className="block text-xs font-medium text-muted-foreground">
              Cravings, covered
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
