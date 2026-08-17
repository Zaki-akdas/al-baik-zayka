import { MapPin, MessageCircle, Navigation, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { interiorShots } from "@/data/gallery";
import { restaurant, addressLine } from "@/data/restaurant";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function RestaurantSection() {
  return (
    <section
      id="location"
      className="scroll-mt-20 bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Restaurant experience"
          title="Come"
          accent="visit us"
          subtitle="Drop by Al-Baik Zayka for a quick bite or order from home."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Interior photos */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-3">
            <Reveal className="col-span-2">
              <div className="overflow-hidden rounded-3xl border border-border">
                <img
                  src={interiorShots[0].image}
                  alt={interiorShots[0].alt}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
            </Reveal>
            {interiorShots.slice(1).map((shot, i) => (
              <Reveal key={shot.id} delay={0.1 + i * 0.08}>
                <div className="overflow-hidden rounded-3xl border border-border">
                  <img
                    src={shot.image}
                    alt={shot.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>
              </Reveal>
            ))}
          </div>

          {/* Location card */}
          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-7">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-maroon/10 text-maroon">
                <MapPin className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl uppercase tracking-wide">
                Find us here
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">
                {restaurant.address.landmark}
                <br />
                {restaurant.address.street}
                <br />
                {restaurant.address.nearby}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Home delivery available — call or WhatsApp to order.
              </p>

              <div className="mt-auto space-y-3 pt-7">
                <Button
                  size="lg"
                  asChild
                  className="h-12 w-full text-base"
                >
                  <a
                    href={restaurant.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="size-5" />
                    Get Directions
                  </a>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild>
                    <a href={telLink}>
                      <Phone className="size-4" /> Call
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="border-green-600/40 text-green-700 hover:bg-green-600/10"
                  >
                    <a
                      href={waLink(generalOrderMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" /> WhatsApp
                    </a>
                  </Button>
                </div>
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  {addressLine}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
