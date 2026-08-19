import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, friendlyErrorMessage } from "@/lib/utils";

type Offer = Doc<"offers">;

const BADGES = ["COMBO", "TODAY'S SPECIAL", "LIMITED OFFER", "NEW"] as const;

const BADGE_COLORS: Record<string, string> = {
  COMBO: "bg-gold text-[#3a2403]",
  "TODAY'S SPECIAL": "bg-maroon text-cream",
  "LIMITED OFFER": "bg-red-600 text-white",
  NEW: "bg-green-600 text-white",
};

interface OfferFormState {
  title: string;
  badge: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  validUntil: string;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm: OfferFormState = {
  title: "",
  badge: "COMBO",
  description: "",
  price: "",
  originalPrice: "",
  image: "",
  validUntil: "",
  isActive: true,
  sortOrder: 0,
};

function formFromOffer(o: Offer): OfferFormState {
  return {
    title: o.title,
    badge: o.badge,
    description: o.description,
    price: o.price !== undefined ? String(o.price) : "",
    originalPrice: o.originalPrice !== undefined ? String(o.originalPrice) : "",
    image: o.image,
    validUntil: o.validUntil ?? "",
    isActive: o.isActive,
    sortOrder: o.sortOrder,
  };
}

const fallbackImage =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop";

export default function OffersTab() {
  const offers = useQuery(api.offers.listAll);
  const createOffer = useMutation(api.offers.create);
  const updateOffer = useMutation(api.offers.update);
  const removeOffer = useMutation(api.offers.remove);
  const seedDefaults = useMutation(api.offers.seedDefaults);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<OfferFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Offer | null>(null);
  const [removing, setRemoving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: (offers?.length ?? 0) + 1 });
    setDialogOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm(formFromOffer(o));
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (!form.title.trim() || !form.description.trim()) {
        toast("Title and description are required");
        return;
      }

      const payload = {
        title: form.title.trim(),
        badge: form.badge as (typeof BADGES)[number],
        description: form.description.trim(),
        price: form.price ? Number(form.price) : undefined,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        image: form.image.trim() || fallbackImage,
        validUntil: form.validUntil.trim() || undefined,
        isActive: form.isActive,
        sortOrder: form.sortOrder,
      };

      if (editing) {
        await updateOffer({ id: editing._id, ...payload });
        toast("Offer updated");
      } else {
        await createOffer(payload);
        toast("Offer created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not save offer"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await removeOffer({ id: deleting._id });
      toast("Offer deleted");
      setDeleting(null);
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not delete offer"));
    } finally {
      setRemoving(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await seedDefaults();
      toast(res.seeded ? `Imported ${res.count} default offers` : "Offers already exist");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not seed offers"));
    }
  };

  const toggleActive = async (offer: Offer) => {
    try {
      await updateOffer({ id: offer._id, isActive: !offer.isActive });
      toast(offer.isActive ? "Offer deactivated" : "Offer activated");
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not update offer"));
    }
  };

  /* ---- Loading skeleton ---- */
  if (offers === undefined) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="size-20 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {offers.length} offer{offers.length === 1 ? "" : "s"} configured
        </p>
        <div className="flex flex-wrap gap-2">
          {offers.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeed}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <UtensilsCrossed className="size-4" />
              Import defaults
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add offer
          </Button>
        </div>
      </div>

      {/* Offers list */}
      {offers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Tag className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            No offers yet. Create your first combo offer or import the defaults.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <article
              key={offer._id}
              className={cn(
                "flex gap-4 rounded-2xl border bg-card p-4 transition-opacity",
                offer.isActive ? "border-border" : "border-border opacity-60",
              )}
            >
              {/* Image */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="size-full object-cover"
                />
                <span
                  className={cn(
                    "absolute top-1 left-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                    BADGE_COLORS[offer.badge] ?? "bg-gray-200 text-gray-800",
                  )}
                >
                  {offer.badge}
                </span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-wide">
                      {offer.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {offer.price !== undefined && offer.price !== null && (
                    <span className="font-bold text-maroon">₹{offer.price}</span>
                  )}
                  {offer.originalPrice !== undefined && offer.originalPrice !== null && (
                    <span className="line-through">₹{offer.originalPrice}</span>
                  )}
                  {offer.validUntil && (
                    <span>Valid until: {offer.validUntil}</span>
                  )}
                  <span className="text-[10px]">#{offer.sortOrder}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(offer)}
                    className="h-8 border-border text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(offer)}
                    className={cn(
                      "h-8 border-border",
                      offer.isActive
                        ? "text-green-600 hover:bg-green-50 hover:text-green-700"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {offer.isActive ? "Active" : "Inactive"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleting(offer)}
                    className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">
              {editing ? "Edit offer" : "Add offer"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Combo offers appear on the homepage under &ldquo;Offers &amp; combos&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Zayka Special Combo"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Badge</Label>
              <Select
                value={form.badge}
                onValueChange={(v) => setForm({ ...form, badge: v })}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Sort order</Label>
              <Input
                type="number"
                min={1}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
                className="border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What makes this combo special…"
                rows={2}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Price (₹) <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="299"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Original price (₹) <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
              <Input
                type="number"
                min={0}
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="399"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Valid until <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
              <Input
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
                placeholder="e.g. Dec 31, 2026"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">
              Delete offer?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              &ldquo;{deleting?.title}&rdquo; will be removed from the homepage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={removing}
            >
              {removing ? "Deleting…" : "Delete offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
