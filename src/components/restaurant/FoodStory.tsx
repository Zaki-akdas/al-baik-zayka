import { MessageCircle, Phone, Truck } from "lucide-react";

import { restaurant } from "@/data/restaurant";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const trustCards = [
  {
    icon: Truck,
    title: "Home Delivery",
    detail: "Available — order by call or WhatsApp",
  },
  {
    icon: Phone,
    title: "Order Direct",
    detail: `Call ${restaurant.phone} or message us`,
  },
  {
    icon: MessageCircle,
    title: "Affordable Combos",
    detail: "Combo cravings, covered daily",
  },
];

export function FoodStory() {
  return (
    <section id="about" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Collage */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 shadow-xl shadow-maroon/15">
              <img
                src={img("photo-1529006557810-274b9b2fc783")}
                alt="Al-Baik Zayka chicken shawarma being prepared"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -right-4 -bottom-6 w-40 overflow-hidden rounded-2xl border-4 border-background shadow-lg shadow-maroon/15 sm:-right-8 sm:w-52">
              <img
                src={img("photo-1573080496219-bb080dd4f877")}
                alt="Al-Baik Zayka loaded fries"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="animate-float absolute -top-5 -left-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-lg shadow-maroon/25 sm:-left-6">
              <span className="block font-display text-lg uppercase leading-none">
                Made Fresh
              </span>
              <span className="block text-xs text-primary-foreground/75">
                Every single order
              </span>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Our story"
            title="The Zayka you"
            accent="crave"
          />
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
              At Al-Baik Zayka, every bite is about bold flavour, satisfying
              portions and fast food made for real cravings. Whether you're
              grabbing a quick meal or ordering for home, we've got something
              worth coming back for.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-3">
              {trustCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <card.icon className="size-5 text-maroon" />
                  <p className="mt-2.5 text-sm font-bold">{card.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={waLink(generalOrderMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                <MessageCircle className="size-4" />
                Order on WhatsApp
              </a>
              <a
                href={telLink}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-maroon/30"
              >
                <Phone className="size-4" />
                Call {restaurant.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
