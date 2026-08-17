import { MapPin, Phone, Truck, UtensilsCrossed } from "lucide-react";

import { restaurant, addressLine } from "@/data/restaurant";
import { telLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

const actions = [
  {
    icon: UtensilsCrossed,
    title: "Order Now",
    detail: "Fast and easy ordering",
    href: "#menu",
    cta: "Browse menu",
  },
  {
    icon: Truck,
    title: "Home Delivery",
    detail: "Get your favourites delivered",
    href: "#contact",
    cta: "Delivery info",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: restaurant.phone,
    href: telLink,
    cta: "Call now",
  },
  {
    icon: MapPin,
    title: "Find Us",
    detail: addressLine,
    href: "#location",
    cta: "Get directions",
  },
];

export function QuickActions() {
  const scroll = (href: string) => {
    if (href.startsWith("tel:")) return;
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-background py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {actions.map((action, i) => (
          <Reveal key={action.title} delay={i * 0.08}>
            <a
              href={action.href}
              onClick={(e) => {
                if (!action.href.startsWith("tel:")) {
                  e.preventDefault();
                  scroll(action.href);
                }
              }}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-maroon/25 hover:bg-white hover:shadow-lg hover:shadow-maroon/10"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-maroon/10 text-maroon transition-colors group-hover:bg-maroon group-hover:text-primary-foreground">
                <action.icon className="size-5" />
              </span>
              <span className="mt-4 font-display text-lg uppercase tracking-wide text-foreground">
                {action.title}
              </span>
              <span className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                {action.detail}
              </span>
              <span className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-maroon">
                {action.cta} →
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
