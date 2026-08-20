import { Play } from "lucide-react";

import { prepSteps } from "@/data/gallery";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * "Made fresh. Served hot." — swap in the restaurant's own vertical reel
 * videos via `videoUrl` on each step; until then the poster images are shown.
 */
export function FoodPreparation() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="From our kitchen"
          title="Made fresh."
          accent="Served hot"
          subtitle="Watch how your order comes together — prepped, sauced and grilled right in front of you."
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:mt-12 lg:grid-cols-5">
          {prepSteps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.07}>
              <article className="group relative overflow-hidden rounded-3xl border border-border bg-card">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={step.image}
                    alt={`Al-Baik Zayka — ${step.title.toLowerCase()}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />

                  {step.videoUrl && (
                    <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-card/90 text-maroon shadow">
                      <Play className="size-4 fill-current" />
                    </span>
                  )}

                  <span className="absolute top-3 left-3 font-display text-2xl text-gold/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-base uppercase leading-tight tracking-wide text-cream sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs leading-snug text-cream/70">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
