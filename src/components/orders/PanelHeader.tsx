import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoBadge } from "@/components/restaurant/LogoBadge";
import { useAuth } from "@/hooks/use-auth";

/** Dark panel header with brand, back-to-site, optional links and sign out. */
export function PanelHeader({ right }: { right?: ReactNode }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Back to the Al-Baik Zayka website"
        >
          <LogoBadge className="size-10" />
          <span className="leading-none">
            <span className="block font-display text-lg uppercase tracking-wide">
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
            className="text-white/70 hover:bg-white/5 hover:text-gold-bright"
          >
            <Link to="/">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
          </Button>
          {right}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-white/15 text-white/80 hover:bg-white/5 hover:text-white"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
