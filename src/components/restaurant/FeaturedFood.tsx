import { featuredItemIds, type MenuItem } from "@/data/menu";
import { Button } from "@/components/ui/button";
import { useMenuItems } from "@/lib/menu-source";
import { MenuCard } from "./MenuCard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

interface FeaturedFoodProps {
  onOpen: (item: MenuItem) => void;
}

export function FeaturedFood({ onOpen }: FeaturedFoodProps) {
  const { items, fromDb } = useMenuItems();

  const featured: MenuItem[] = fromDb
    ? items
        .filter(
          (item) => item.isAvailable !== false && item.isPopular,
        )
        .slice(0, 6)
    : featuredItemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is MenuItem => Boolean(item));

  const scrollToMenu = () =>
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What's cooking?"
          title="Fresh from the kitchen"
          accent="Zayka"
          subtitle="Your favourite fast food, freshly prepared and packed with flavour."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, i) => (
            <Reveal key={item.id} delay={(i % 3) * 0.08}>
              <MenuCard item={item} onOpen={onOpen} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button size="lg" variant="outline" onClick={scrollToMenu}>
            View Full Menu
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
