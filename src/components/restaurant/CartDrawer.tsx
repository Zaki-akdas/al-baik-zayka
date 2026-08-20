import { useState } from "react";
import { useNavigate } from "react-router";
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

import { placeOrder as dbPlaceOrder } from "@/lib/db";
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
import { useMenu } from "@/lib/menu-source";
import { cartOrderMessage, waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type View = "cart" | "checkout" | "done";

export function CartDrawer() {
  const { items, count, total, setQty, remove, clear, isOpen, setIsOpen } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const menuItems = useMenu();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("cart");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);

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
      const orderItems = items.map((l) => {
        const menuItem = menuItems.find((m) => m.id === l.id);
        return {
          product_id: l.id,
          name: l.name,
          category: menuItem?.category ?? "",
          qty: l.qty,
          price: l.price,
        };
      });

      const res = await dbPlaceOrder({
        customer_name: name,
        customer_phone: phone,
        address,
        order_type: orderType,
        items: orderItems,
        total,
        status: "placed",
        notes: notes || null,
      });
      setPlacedId(res.id);
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
          (items.length === 0 ? (
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
                {items.map((line) => (
                  <div key={line.id} className="flex items-center gap-2 py-3 sm:gap-3 sm:py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{line.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setQty(line.id, line.qty - 1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-bold">
                        {line.qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={() => setQty(line.id, line.qty + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <p className="w-16 text-right text-sm font-bold">
                      ₹{line.price * line.qty}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-red-600"
                      onClick={() => remove(line.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <SheetFooter className="border-t px-5 py-4">
                <div className="flex w-full items-center justify-between">
                  <p className="font-display text-2xl text-maroon">₹{total}</p>
                  <div className="flex gap-2">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
                    >
                      <MessageCircle className="size-4" />
                      WhatsApp
                    </a>
                    <Button
                      className="bg-gold text-[#3a2403] hover:bg-gold-bright"
                      onClick={startCheckout}
                    >
                      Checkout
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </>
          ))}

        {/* ---- Checkout view ---- */}
        {view === "checkout" && (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/80">Your name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/80">Phone number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="border-border bg-background text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/80">Order type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={orderType === "delivery" ? "default" : "outline"}
                    onClick={() => setOrderType("delivery")}
                    className={cn(
                      "flex-1",
                      orderType === "delivery"
                        ? "bg-maroon text-cream"
                        : "border-border text-foreground/80",
                    )}
                  >
                    Delivery
                  </Button>
                  <Button
                    type="button"
                    variant={orderType === "pickup" ? "default" : "outline"}
                    onClick={() => setOrderType("pickup")}
                    className={cn(
                      "flex-1",
                      orderType === "pickup"
                        ? "bg-maroon text-cream"
                        : "border-border text-foreground/80",
                    )}
                  >
                    Pickup
                  </Button>
                </div>
              </div>
              {orderType === "delivery" && (
                <div className="space-y-1.5">
                  <Label className="text-foreground/80">Delivery address</Label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address for delivery"
                    rows={2}
                    required
                    className="border-border bg-background text-foreground"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-foreground/80">
                  Notes <span className="font-normal normal-case text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                  rows={2}
                  className="border-border bg-background text-foreground"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <SheetFooter className="border-t px-5 py-4">
              <div className="flex w-full items-center justify-between">
                <p className="font-display text-2xl text-maroon">₹{total}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setView("cart")}
                    className="border-border text-foreground/80"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gold text-[#3a2403] hover:bg-gold-bright"
                  >
                    {submitting ? "Placing…" : "Place order"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </form>
        )}

        {/* ---- Done view ---- */}
        {view === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="font-display text-xl uppercase tracking-wide">
              Order placed!
            </p>
            <p className="text-sm text-muted-foreground">
              Your order has been sent to the kitchen. You can track it on your
              dashboard.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-border text-foreground/80"
              >
                Keep browsing
              </Button>
              <Button asChild className="bg-gold text-[#3a2403] hover:bg-gold-bright">
                <a href="/dashboard">
                  View order
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
