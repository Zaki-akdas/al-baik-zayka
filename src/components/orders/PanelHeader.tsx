import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Button } from "@/components/ui/button";
import { LogoBadge } from "@/components/restaurant/LogoBadge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface PanelHeaderProps {
  right?: ReactNode;
  /** "light" for cream/paper pages (customer dashboard), "dark" for night pages. */
  theme?: "light" | "dark";
}

/** Shared panel header with brand, back-to-site, optional links and sign out. */
export function PanelHeader({ right, theme = "dark" }: PanelHeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const light = theme === "light";

  return (
    <header
      className={cn("border-b", light ? "border-border" : "border-white/10")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Back to the Al-Baik Zayka website"
        >
          <LogoBadge className="size-10" />
          <span className="leading-none">
            <span
              className={cn(
                "block font-display text-lg uppercase tracking-wide",
                light ? "text-foreground" : "text-cream",
              )}
            >
              Al-Baik
            </span>
            <span className="block font-script text-lg font-bold leading-tight text-gold-bright">
              Zayka
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            className={
              light
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/5 hover:text-gold-bright"
            }
          >
            <Link to="/">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </Button>
          {right}
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={handleSignOut}
            className={
              light
                ? "border-border text-foreground hover:bg-muted hover:text-foreground"
                : "border-white/15 text-white/80 hover:bg-white/5 hover:text-white"
            }
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
