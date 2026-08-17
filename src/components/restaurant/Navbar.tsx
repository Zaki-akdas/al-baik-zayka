import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Menu, Phone, ShoppingBag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LogoBadge } from "@/components/restaurant/LogoBadge";
import { navLinks } from "@/data/restaurant";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { telLink, waLink, generalOrderMessage } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function scrollToSection(href: string) {
  if (href === "#home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMenuOpen(false);
    scrollToSection(href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/85 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={() => go("#home")}
          className="flex items-center gap-3 text-left"
          aria-label="Al-Baik Zayka — back to top"
        >
          <LogoBadge />
          <span className="leading-none">
            <span className="block font-display text-lg uppercase tracking-wide text-foreground">
              Al-Baik
            </span>
            <span className="block font-script text-lg font-bold leading-tight text-maroon">
              Zayka
            </span>
          </span>
        </button>

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => go(link.href)}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          ))}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              Admin
            </Link>
          )}
          {user?.role === "delivery" && (
            <Link
              to="/delivery"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              Delivery
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
            aria-label={`Open your order (${count} items)`}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={isAuthenticated ? "My account" : "Sign in"}
          >
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              <User className="size-5" />
            </Link>
          </Button>
          <Button
            className="hidden sm:inline-flex"
            onClick={() => go("#menu")}
          >
            Order Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile sheet (controlled) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72 gap-0 p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="flex items-center gap-3">
              <LogoBadge className="size-8" />
              <span className="font-display text-base uppercase tracking-wide">
                Al-Baik Zayka
              </span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => go(link.href)}
                className="rounded-lg px-3 py-3 text-left text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </button>
            ))}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-left text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Admin Panel
              </Link>
            )}
            {user?.role === "delivery" && (
              <Link
                to="/delivery"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-left text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Delivery Dashboard
              </Link>
            )}
          </nav>
          <div className="mt-auto space-y-2 border-t px-4 py-4">
            <Button
              variant="outline"
              className="w-full"
              asChild
              onClick={() => setMenuOpen(false)}
            >
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                <User className="size-4" />
                {isAuthenticated ? "My Account" : "Sign in"}
              </Link>
            </Button>
            <Button className="w-full" onClick={() => go("#menu")}>
              Order Now
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <a href={telLink}>
                  <Phone className="size-4" /> Call
                </a>
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-green-600/40 text-green-700 hover:bg-green-600/10"
              >
                <a
                  href={waLink(generalOrderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
