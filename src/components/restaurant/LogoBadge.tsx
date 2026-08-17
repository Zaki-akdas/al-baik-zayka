import { restaurant } from "@/data/restaurant";
import { cn } from "@/lib/utils";

interface LogoBadgeProps {
  className?: string;
}

/**
 * Circular brand badge — a placeholder for the real Al-Baik Zayka logo.
 * Set `restaurant.logoUrl` in src/data/restaurant.ts to render the actual
 * uploaded logo instead.
 */
export function LogoBadge({ className }: LogoBadgeProps) {
  if (restaurant.logoUrl) {
    return (
      <img
        src={restaurant.logoUrl}
        alt={`${restaurant.name} logo`}
        className={cn("size-10 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gold/80 bg-gradient-to-b from-maroon to-[#4a0f14]",
        className,
      )}
    >
      <span className="text-center font-display text-[9px] uppercase leading-[1.1] tracking-wide text-cream">
        Albaik
        <span className="block font-script text-[11px] font-bold normal-case leading-none text-gold-bright">
          Zayka
        </span>
      </span>
      <span className="pointer-events-none absolute inset-[-4px] rounded-full border border-gold/30" />
    </div>
  );
}
