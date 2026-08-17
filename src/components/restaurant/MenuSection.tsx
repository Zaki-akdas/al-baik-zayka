import { useMemo, useState } from "react";
import { Leaf, Search, SearchX } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { MenuItem } from "@/data/menu";
import { useMenuItems } from "@/lib/menu-source";
import { cn } from "@/lib/utils";
import { MenuCard } from "./MenuCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

interface MenuSectionProps {
  onOpen: (item: MenuItem) => void;
}

const ALL = "All";

export function MenuSection({ onOpen }: MenuSectionProps) {
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const { items, categories, fromDb } = useMenuItems();

  const availableItems = fromDb
    ? items.filter((item) => item.isAvailable !== false)
    : items;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availableItems.filter((item) => {
      if (category !== ALL && item.category !== category) return false;
      if (vegOnly && item.veg !== true) return false;
      if (q) {
        const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [category, query, vegOnly, availableItems]);

  return (
    <section id="menu" className="scroll-mt-20 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The menu"
          title="Pick your"
          accent="craving"
          subtitle="Freshly prepared fast food, combos and everyday favourites — prices confirmed on WhatsApp."
        />

        {/* Controls */}
        <Reveal className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Category pills */}
            <div
              role="tablist"
              aria-label="Menu categories"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0"
            >
              {[ALL, ...categories].map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={category === cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    category === cat
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-maroon/30 hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search + veg filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the menu…"
                  className="h-10 rounded-full pl-9"
                  aria-label="Search the menu"
                />
              </div>
              <button
                type="button"
                onClick={() => setVegOnly((v) => !v)}
                aria-pressed={vegOnly}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all",
                  vegOnly
                    ? "border-green-600/50 bg-green-600/10 text-green-700"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                <Leaf className="size-4" />
                Veg
              </button>
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 0.06}>
                <MenuCard item={item} onOpen={onOpen} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <SearchX className="size-10 text-muted-foreground/50" />
            <p className="text-lg font-semibold">Nothing matches that craving</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a different search, or ask us on WhatsApp — we might have it
              anyway.
            </p>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          {fromDb
            ? "Menu and prices are set by the restaurant and updated live."
            : "Menu being updated from our latest Instagram posts — prices confirmed on WhatsApp."}{" "}
          Follow{" "}
          <a
            href="https://www.instagram.com/albaik_zayka/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-maroon hover:underline"
          >
            @albaik_zayka
          </a>{" "}
          for the newest items and offers.
        </p>
      </div>
    </section>
  );
}
