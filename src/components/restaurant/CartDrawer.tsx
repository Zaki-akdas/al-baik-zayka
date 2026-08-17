import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { useMenuItems } from "@/lib/menu-source";
import { cartOrderMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type View = "cart" | "checkout" | "done";

export function CartDrawer() {
  const { items, count, total, setQty, remove, clear, isOpen, setIsOpen } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const { items: menuItems, fromDb } = useMenuItems();
  const navigate = useNavigate();
  const placeOrder = useMutation(api.orders.placeOrder);

  const [view, setView] = useState<View>("cart");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);

  const lines = items
    .map((line) => ({
      ...line,
      item: menuItems.find((m) => m.id === line.id),
    }))
    .filter((line) => line.item !== undefined);

  const whatsappHref = waLink(cartOrderMessage(items));

  const startCheckout = () => {
    if (!isAuthenticated) {
      toast("Sign in to place your order — your cart is saved");
      navigate("/auth?returnTo=/");
      return;
    }
    if (user?.name && !name) setName(user.name);
    setError(null);
    setView("checkout");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await placeOrder({
        items: items.map((l) => ({
          productId: l.id as Id<"products">,
          qty: l.qty,
        })),
        customerName: name,
        customerPhone: phone,
        address,
        orderType,
        notes,
      });
      setPlacedId(res.orderId);
      clear();
      setView("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setSubmitting(false);
    }
  };

  const browse = () => {
    setIsOpen(false);
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) setView("cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full max-w-sm gap-0 p-0 sm:w-96">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl uppercase tracking-wide">
            <ShoppingBag className="size-5 text-maroon" />
            {view === "cart" && "Your Order"}
            {view === "checkout" && "Checkout"}
            {view === "done" && "Order placed"}
          </SheetTitle>
          <SheetDescription className="text-sm">
            {view === "cart" &&
              (count > 0
                ? `${count} item${count > 1 ? "s" : ""} in your order`
                : "Your order is empty")}
            {view === "checkout" && "Confirm your details to place the order"}
            {view === "done" && "Thanks — the restaurant is on it!"}
          </SheetDescription>
        </SheetHeader>

        {/* ---- Cart view ---- */}
        {view === "cart" &&
          (lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-maroon/10 text-maroon">
                <ShoppingBag className="size-7" />
              </span>
              <p className="font-semibold">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">
                Hungry? Pick something from the menu — combos are always a good
                idea.
              </p>
              <Button onClick={browse}>Browse Menu</Button>
            </div>
          ) : (
            <>
              <div className="flex-1 divide-y divide-border overflow-y-auto px-5">
                {lines.map(({ id, name: lineName, qty, price, item }) => (
                  <div key={id} className="flex items-center gap-3 py-4">
                    <img
                      src={item!.image}
                      alt={lineName}
                      loading="lazy"
                      className="size-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{lineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {fromDb ? `₹${price} each` : "Price on WhatsApp"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-7"
                        onClick={() => setQty(id, qty - 1)}
                        aria-label={`Decrease ${lineName} quantity`}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold" aria-live="polite">
                        {qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="size-7"
                        onClick={() => setQty(id, qty + 1)}
                        aria-label={`Increase ${lineName} quantity`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(id)}
                      aria-label={`Remove ${lineName}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <SheetFooter className="gap-3 border-t px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-display text-lg">
                    {fromDb ? `₹${total}` : "Confirmed on WhatsApp"}
                  </span>
                </div>
                {fromDb ? (
                  <Button
                    size="lg"
                    className="h-12 w-full text-base"
                    onClick={startCheckout}
                  >
                    Place Order
                    <ArrowRight className="size-5" />
                  </Button>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    In-app ordering opens once the restaurant sets up the menu.
                    Until then, order on WhatsApp.
                  </p>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="h-11 w-full border-green-600/40 text-green-700 hover:bg-green-600/10"
                >
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-5" />
                    Order on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 text-muted-foreground"
                  onClick={clear}
                >
                  Clear order
                </Button>
              </SheetFooter>
            </>
          ))}

        {/* ---- Checkout view ---- */}
        {view === "checkout" && (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-4 px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="co-name">Your name</Label>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-phone">Phone</Label>
                <Input
                  id="co-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label>Order type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["delivery", "pickup"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-xl border text-sm font-semibold capitalize transition-colors",
                        orderType === type
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {type === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-address">
                  {orderType === "delivery" ? "Delivery address" : "Address (optional)"}
                </Label>
                <Textarea
                  id="co-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    orderType === "delivery"
                      ? "House, street, landmark…"
                      : "Landmark for pickup (optional)"
                  }
                  required={orderType === "delivery"}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co-notes">Notes (optional)</Label>
                <Input
                  id="co-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Spice level, extras…"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <SheetFooter className="gap-2 border-t px-5 py-4">
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full text-base"
                disabled={submitting}
              >
                {submitting ? "Placing order…" : `Pay ${fromDb ? `₹${total}` : ""} on delivery`}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 text-muted-foreground"
                onClick={() => setView("cart")}
                disabled={submitting}
              >
                Back to cart
              </Button>
            </SheetFooter>
          </form>
        )}

        {/* ---- Done view ---- */}
        {view === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-green-600/10 text-green-600">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="font-display text-2xl uppercase tracking-wide">
              Zayka on the way!
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Order{" "}
              <span className="font-semibold text-foreground">
                #{placedId?.slice(-6).toUpperCase()}
              </span>{" "}
              is placed. The restaurant will confirm it — track its status
              anytime from My Orders.
            </p>
            <div className="grid w-full gap-2">
              <Button
                size="lg"
                className="h-12 w-full text-base"
                onClick={() => {
                  setView("cart");
                  setIsOpen(false);
                  navigate("/dashboard");
                }}
              >
                Track my order
                <ArrowRight className="size-5" />
              </Button>
              <Button variant="outline" onClick={browse}>
                Continue browsing
              </Button>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5" />
              Questions? Call the restaurant directly.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
