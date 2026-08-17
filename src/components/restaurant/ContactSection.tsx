import { Instagram, MapPin, MessageCircle, Phone, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { restaurant, addressLine } from "@/data/restaurant";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const contactCards = [
  {
    icon: Phone,
    title: "Call Us",
    detail: restaurant.phone,
    sub: `Ask for ${restaurant.contactPerson}`,
    href: telLink,
    cta: "Call now",
  },
  {
    icon: Truck,
    title: "Home Delivery",
    detail: "Available",
    sub: "Order by call or WhatsApp",
    href: waLink(generalOrderMessage),
    cta: "Order delivery",
  },
  {
    icon: Instagram,
    title: "Instagram",
    detail: restaurant.instagramHandle,
    sub: "Daily food, offers & updates",
    href: restaurant.instagramUrl,
    cta: "Follow us",
  },
  {
    icon: MapPin,
    title: "Location",
    detail: restaurant.address.landmark,
    sub: addressLine,
    href: restaurant.mapsUrl,
    cta: "Get directions",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Order or say"
          accent="hello"
          subtitle="Call, WhatsApp or drop by — whatever's easiest for you."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.07}>
              <a
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  card.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-maroon/25 hover:shadow-lg hover:shadow-maroon/10"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-maroon/10 text-maroon transition-colors group-hover:bg-maroon group-hover:text-primary-foreground">
                  <card.icon className="size-5" />
                </span>
                <span className="mt-4 font-display text-lg uppercase tracking-wide">
                  {card.title}
                </span>
                <span className="mt-1 text-sm font-semibold text-foreground">
                  {card.detail}
                </span>
                <span className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {card.sub}
                </span>
                <span className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-maroon">
                  {card.cta} →
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        {/* Big CTA row */}
        <Reveal className="mt-10">
          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-border bg-gradient-to-r from-maroon/10 via-card to-gold/15 p-7 sm:p-8 lg:flex-row">
            <div>
              <h3 className="font-display text-2xl uppercase tracking-wide sm:text-3xl">
                Hungry? Let's fix that.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                One tap to order — we'll confirm price, availability and
                delivery on WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href={telLink}>
                  <Phone className="size-5" />
                  Call Now
                </a>
              </Button>
              <Button
                size="lg"
                asChild
                className="border-green-600/40 bg-green-600/10 text-green-700 hover:bg-green-600/20"
              >
                <a
                  href={waLink(generalOrderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp Order
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href={restaurant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="size-5" />
                  Instagram
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="size-5" />
                  Get Directions
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
