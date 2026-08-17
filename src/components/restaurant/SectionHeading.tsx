import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Optional script-accent word rendered in gold, e.g. "Zayka". */
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  align = "center",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs font-bold uppercase tracking-[0.25em]",
          dark ? "text-gold" : "text-maroon",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl md:text-6xl",
          dark ? "text-cream" : "text-foreground",
        )}
      >
        {title}{" "}
        {accent && (
          <span className={cn("font-script normal-case", dark ? "text-gold-bright" : "text-maroon")}>
            {accent}
          </span>
        )}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            dark ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
