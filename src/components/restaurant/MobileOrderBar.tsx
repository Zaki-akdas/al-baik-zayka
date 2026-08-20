import { MessageCircle, Phone, ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";
import { generalOrderMessage, telLink, waLink } from "@/lib/whatsapp";

export function MobileOrderBar() {
  const { count, setIsOpen } = useCart();

  const orderNow = () => {
    if (count > 0) {
      setIsOpen(true);
    } else {
      document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1.5 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
        <button
          type="button"
          onClick={orderNow}
          className="relative flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground transition-transform active:scale-[0.98] sm:h-12 sm:gap-2 sm:text-sm"
        >
          <ShoppingBag className="size-5" />
          Order Now
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-extrabold text-[#3a2403]">
              {count}
            </span>
          )}
        </button>
        <a
          href={waLink(generalOrderMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-green-600/40 bg-green-600/10 text-xs font-semibold text-green-700 transition-transform active:scale-[0.98] sm:h-12 sm:gap-2 sm:text-sm"
        >
          <MessageCircle className="size-5" />
          WhatsApp
        </a>
        <a
          href={telLink}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground transition-transform active:scale-[0.98] sm:h-12 sm:gap-2 sm:text-sm"
        >
          <Phone className="size-5" />
          Call
        </a>
      </div>
    </div>
  );
}
