import { useState } from "react";
import { useMutation } from "convex/react";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/StarRating";
import { formatOrderId } from "@/data/orders";
import { friendlyErrorMessage } from "@/lib/utils";

type Order = Doc<"orders">;

interface ReviewDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

export function ReviewDialog({ order, open, onOpenChange }: ReviewDialogProps) {
  const rateOrder = useMutation(api.orders.rateOrder);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      await rateOrder({
        orderId: order._id,
        rating,
        review: review.trim() || undefined,
      });
      toast("Thanks for your feedback!");
      onOpenChange(false);
      // Reset
      setRating(0);
      setReview("");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not submit rating"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl uppercase tracking-wide">
            Rate your order
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            How was your experience with order {formatOrderId(order._id)}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2">
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
            />
            {rating > 0 && (
              <span className="text-sm font-semibold text-maroon">
                {ratingLabels[rating]}
              </span>
            )}
          </div>

          {/* Review text */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Add a comment <span className="font-normal normal-case">(optional)</span>
            </p>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about the food quality, delivery speed, packaging…"
              rows={3}
              maxLength={500}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {review.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-gold text-[#3a2403] hover:bg-gold-bright"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <MessageSquarePlus className="size-4" />
                Submit review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
