import { useState } from "react";
import { BadgeCheck, Leaf, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/lib/cart";

interface ItemDialogProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDialog({ item, onClose }: ItemDialogProps) {
  const [qty, setQty] = useState(1);
  const { add, setIsOpen } = useCart();

  if (!item) return null;

  const handleAdd = () => {
    add(item.id, item.name, item.price ?? 0, qty);
    toast(`${item.name} × ${qty} added to your order`);
    onClose();
    setQty(1);
  };

  const handleOrderNow = () => {
    add(item.id, item.name, item.price ?? 0, qty);
    onClose();
    setQty(1);
    setIsOpen(true);
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md gap-0 overflow-y-auto p-0 sm:rounded-3xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl">
          <img
            src={item.image}
            alt={`Al-Baik Zayka ${item.name.toLowerCase()}`}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {item.isPopular && (
              <Badge className="border-transparent bg-gold text-[10px] font-extrabold tracking-wider text-[#3a2403]">
                POPULAR
              </Badge>
            )}
            {item.isOffer && (
              <Badge className="border-transparent bg-white/90 text-[10px] font-extrabold tracking-wider text-maroon">
                COMBO
              </Badge>
            )}
          </div>
        </div>

        <DialogHeader className="px-5 pt-4">
          <DialogTitle className="font-display text-2xl uppercase tracking-wide">
            {item.name}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {item.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 px-5 pt-4">
          {item.veg !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/80">
              {item.veg ? (
                <Leaf className="size-3.5 text-green-600" />
              ) : (
                <BadgeCheck className="size-3.5 text-red-500" />
              )}
              {item.veg ? "Vegetarian" : "Non-vegetarian"}
            </span>
          )}
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/80">
            {item.price !== null ? `₹${item.price}` : "Price to be updated"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center font-display text-xl" aria-live="polite">
              {qty}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAdd}>
              Add
            </Button>
            <Button onClick={handleOrderNow}>
              <ShoppingBag className="size-4" />
              Order
            </Button>
          </div>
        </div>

        <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-muted-foreground">
          Prices and availability are confirmed by the restaurant on WhatsApp.
          Home delivery available.
        </p>
      </DialogContent>
    </Dialog>
  );
}
