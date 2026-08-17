import { Heart, Instagram, MessageCircle } from "lucide-react";

import { restaurant } from "@/data/restaurant";
import { generalOrderMessage, waLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";

/**
 * No customer reviews are fabricated. Real reviews live on the restaurant's
 * Instagram/social presence — this band points customers there honestly.
 */
export function SocialProof() {
  return (
    <section className="border-y border-border bg-background py-12 sm:py-14">
      <Reveal className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-maroon/10 text-maroon">
          <Heart className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
            Loved by our customers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Real reviews and customer posts live on our Instagram. See what
            people are saying about the Zayka — then grab your own order.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={restaurant.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-maroon/30"
          >
            <Instagram className="size-4 text-maroon" />
            See reviews on Instagram
          </a>
          <a
            href={waLink(generalOrderMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <MessageCircle className="size-4" />
            Order on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
