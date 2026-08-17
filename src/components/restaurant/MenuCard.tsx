import { BadgeCheck, Info, Plus, Leaf } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

interface MenuCardProps {
  item: MenuItem;
  onOpen: (item: MenuItem) => void;
}

export function MenuCard({ item, onOpen }: MenuCardProps) {
  const { add } = useCart();

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(item.id, item.name, item.price ?? 0, 1);
    toast(`${item.name} added to your order`);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-maroon/25 hover:shadow-xl hover:shadow-maroon/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={`Al-Baik Zayka ${item.name.toLowerCase()}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.isPopular && (
            <Badge className="border-transparent bg-gold text-[10px] font-extrabold tracking-wider text-[#3a2403]">
              POPULAR
            </Badge>
          )}
          {item.isOffer && (
            <Badge className="border-transparent bg-white/90 text-[10px] font-extrabold tracking-wider text-maroon backdrop-blur-sm">
              COMBO
            </Badge>
          )}
        </div>
        {item.veg !== undefined && (
          <span
            className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
            title={item.veg ? "Vegetarian" : "Non-vegetarian"}
          >
            {item.veg ? (
              <Leaf className="size-3 text-green-400" />
            ) : (
              <BadgeCheck className="size-3 text-red-400" />
            )}
            {item.veg ? "Veg" : "Non-veg"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg uppercase leading-tight tracking-wide text-foreground">
          {item.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {item.price !== null ? (
              <span className="font-display text-2xl leading-none text-maroon">
                ₹{item.price}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Info className="size-3.5" />
                Price to be updated
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="h-9 px-3.5"
            onClick={quickAdd}
            aria-label={`Add ${item.name} to order`}
          >
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
