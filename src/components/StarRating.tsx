"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const interactive = !readonly && !!onChange;
  const displayValue = interactive && hovered > 0 ? hovered : value;

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => interactive && setHovered(0)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={readonly ? `${value} out of 5 stars` : "Rate this order"}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => interactive && onChange(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          className={cn(
            "transition-transform",
            interactive && "cursor-pointer hover:scale-110",
            readonly && "cursor-default",
          )}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              sizeMap[size],
              "transition-colors",
              star <= displayValue
                ? "fill-gold text-gold"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
