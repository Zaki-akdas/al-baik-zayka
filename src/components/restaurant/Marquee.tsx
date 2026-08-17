const words = [
  "Burgers",
  "Shawarma",
  "Wraps",
  "Pizza",
  "Loaded Fries",
  "Combos",
  "Cold Drinks",
  "Home Delivery",
];

function Strip() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span
          key={word}
          className="flex items-center gap-6 pr-6 font-display text-sm uppercase tracking-[0.25em] text-cream/90"
        >
          {word}
          <span className="text-gold">✦</span>
        </span>
      ))}
    </div>
  );
}

/** Full-width scrolling flavour strip. */
export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="marquee-paused overflow-hidden border-y border-gold/30 bg-gradient-to-r from-maroon via-primary to-maroon py-3.5"
    >
      <div className="animate-marquee flex w-max">
        <Strip />
        <Strip />
      </div>
    </div>
  );
}
