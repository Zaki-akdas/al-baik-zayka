import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

import { LogoBadge } from "@/components/restaurant/LogoBadge";
import { navLinks, restaurant } from "@/data/restaurant";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";

export function Footer() {
  const scroll = (href: string) => {
    if (href === "#home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-night pb-28 text-cream lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <LogoBadge className="size-12" />
              <div className="leading-none">
                <span className="block font-display text-xl uppercase tracking-wide">
                  Al-Baik
                </span>
                <span className="block font-script text-xl font-bold leading-tight text-gold-bright">
                  Zayka
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {restaurant.tagline}. Big flavour, real Zayka — from our kitchen
              to your door.
            </p>
            <a
              href={waLink(generalOrderMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-bold text-[#3a2403] transition-all hover:-translate-y-0.5 hover:bg-gold-bright"
            >
              <MessageCircle className="size-4" />
              Order Now
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => scroll(link.href)}
                    className="text-sm text-white/70 transition-colors hover:text-gold-bright"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3.5 text-sm text-white/70">
              <li>
                <a
                  href={telLink}
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-bright"
                >
                  <Phone className="size-4 shrink-0 text-gold" />
                  {restaurant.phone}
                </a>
              </li>
              <li>
                <a
                  href={restaurant.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors hover:text-gold-bright"
                >
                  <Instagram className="size-4 shrink-0 text-gold" />
                  {restaurant.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-gold-bright"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span>
                    {restaurant.address.landmark}
                    <br />
                    {restaurant.address.street}
                    <br />
                    {restaurant.address.nearby}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center text-xs text-white/45 sm:flex-row sm:text-left">
          <p>© 2026 Al-Baik Zayka. All Rights Reserved.</p>
          <p>
            Contact: {restaurant.contactPerson} •{" "}
            <a href={telLink} className="transition-colors hover:text-gold-bright">
              {restaurant.phone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
