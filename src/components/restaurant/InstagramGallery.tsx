import { useState } from "react";
import { ExternalLink, Instagram, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { instagramPosts, type GalleryItem } from "@/data/gallery";
import { restaurant } from "@/data/restaurant";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function InstagramGallery() {
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Instagram"
          title="Follow the"
          accent="Zayka"
          subtitle="Daily food, offers and updates on Instagram."
        />

        <Reveal className="mt-6 flex justify-center">
          <a
            href={restaurant.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-maroon/25 bg-card px-4 py-2 text-sm font-bold text-maroon transition-all hover:-translate-y-0.5 hover:border-maroon/40 hover:shadow-md hover:shadow-maroon/10"
          >
            <Instagram className="size-4" />
            {restaurant.instagramHandle}
          </a>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {instagramPosts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.07}>
              <button
                type="button"
                onClick={() => setActive(post)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ${post.alt}`}
              >
                <img
                  src={post.image}
                  alt={post.alt}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-night/0 transition-colors duration-300 group-hover:bg-night/45">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/0 text-white opacity-0 transition-all duration-300 group-hover:bg-white/20 group-hover:opacity-100">
                    {post.isReel ? (
                      <Play className="size-5 fill-current" />
                    ) : (
                      <Instagram className="size-5" />
                    )}
                  </span>
                </span>
                {post.isReel && (
                  <span className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <Play className="size-3.5 fill-current" />
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button size="lg" asChild className="h-12 px-8 text-base">
            <a
              href={restaurant.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="size-5" />
              Follow on Instagram
            </a>
          </Button>
        </Reveal>
      </div>

      {/* Lightbox */}
      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg gap-0 overflow-y-auto border-none bg-night p-0">
          {active && (
            <>
              <DialogTitle className="sr-only">{active.alt}</DialogTitle>
              <DialogDescription className="sr-only">
                {active.alt} — opens on Instagram
              </DialogDescription>
              <img
                src={active.image}
                alt={active.alt}
                className="w-full rounded-t-2xl object-cover"
              />
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-sm text-white/80">{active.alt}</p>
                <Button size="sm" asChild className="shrink-0">
                  <a
                    href={restaurant.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Open
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
