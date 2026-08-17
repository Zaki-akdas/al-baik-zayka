import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { offers } from "@/data/offers";
import { offerOrderMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Offers() {
  const [heroOffer, ...rest] = offers;

  return (
    <section
      id="offers"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-maroon via-primary to-night py-16 text-cream sm:py-24"
    >
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[10%] h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-25%] h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="Offers & combos"
          title="Combo"
          accent="cravings"
          subtitle="More food. More flavour. More value. Check Instagram for the latest deal of the day."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Hero offer */}
          <Reveal className="lg:row-span-2">
            <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-300 hover:border-gold/40">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={heroOffer.image}
                  alt={`Al-Baik Zayka ${heroOffer.title} combo`}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                <Badge className="absolute top-4 left-4 border-transparent bg-gold text-[10px] font-extrabold tracking-widest text-[#3a2403]">
                  {heroOffer.badge}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">
                  {heroOffer.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                  {heroOffer.description}
                </p>
                <a
                  href={waLink(offerOrderMessage(heroOffer.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-[#3a2403] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-bright hover:shadow-lg hover:shadow-gold/25"
                >
                  Order Now
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </article>
          </Reveal>

          {/* Remaining offers */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {rest.map((offer, i) => (
              <Reveal key={offer.id} delay={i * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-300 hover:border-gold/40">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={offer.image}
                      alt={`Al-Baik Zayka ${offer.title} offer`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
                    <Badge
                      className={cn(
                        "absolute top-3 left-3 border-transparent text-[10px] font-extrabold tracking-widest",
                        offer.badge === "TODAY'S SPECIAL"
                          ? "bg-gold text-[#3a2403]"
                          : "bg-white/90 text-maroon",
                      )}
                    >
                      {offer.badge}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl uppercase tracking-wide">
                      {offer.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/65">
                      {offer.description}
                    </p>
                    <a
                      href={waLink(offerOrderMessage(offer.title))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-sm font-bold text-gold-bright transition-colors hover:text-gold"
                    >
                      Order on WhatsApp
                      <ArrowUpRight className="size-4" />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
