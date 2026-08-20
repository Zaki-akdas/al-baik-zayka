import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { menuItems } from "@/data/menu";

interface OrderItemDialogProps {
  name: string;
  price: number;
  qty: number;
  category?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderItemDialog({
  name,
  price,
  qty,
  category,
  open,
  onOpenChange,
}: OrderItemDialogProps) {
  const menuItem = menuItems.find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  );

  const displayImage = menuItem?.image;
  const description = menuItem?.description;
  const veg = menuItem?.veg;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto border-border bg-card p-0 sm:rounded-3xl sm:max-w-md">
        {displayImage && (
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:rounded-t-3xl">
            <img
              src={displayImage}
              alt={`Al-Baik Zayka ${name.toLowerCase()}`}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {veg !== undefined && (
              <span className="absolute top-3 left-3">
                <Badge className="border-transparent bg-card/90 text-[10px] font-extrabold tracking-wider text-maroon">
                  {veg ? "VEG" : "NON-VEG"}
                </Badge>
              </span>
            )}
          </div>
        )}

        <DialogHeader className="px-5 pt-4">
          <DialogTitle className="font-display text-xl uppercase tracking-wide sm:text-2xl">
            {name}
          </DialogTitle>
          {category && (
            <DialogDescription className="text-xs text-muted-foreground">
              {category}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-3">
            <div>
              <p className="text-xs text-muted-foreground">Price each</p>
              <p className="font-display text-lg text-maroon">₹{price}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-display text-lg text-foreground">×{qty}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display text-lg font-bold text-maroon">
                ₹{price * qty}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="flex-1 border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <Link to="/" onClick={() => onOpenChange(false)}>
                View on menu
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-gold text-[#3a2403] hover:bg-gold-bright"
            >
              <Link to="/" onClick={() => onOpenChange(false)}>
                <ExternalLink className="size-4" />
                Reorder
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Clickable order item                                                */
/* ------------------------------------------------------------------ */
interface OrderItemClickableProps {
  name: string;
  price: number;
  qty: number;
  category?: string;
}

export function OrderItemClickable({
  name,
  price,
  qty,
  category,
}: OrderItemClickableProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/50"
      >
        <span className="min-w-0 truncate text-sm text-foreground/80 group-hover:text-foreground">
          {qty} × {name}
        </span>
        <span className="shrink-0 text-sm font-semibold text-foreground/70">
          ₹{price * qty}
        </span>
      </button>
      <OrderItemDialog
        name={name}
        price={price}
        qty={qty}
        category={category}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
