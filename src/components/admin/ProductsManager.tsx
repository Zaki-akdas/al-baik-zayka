import { useCallback, useEffect, useMemo, useState } from "react";
import { GripVertical, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { friendlyErrorMessage } from "@/lib/utils";
import {
  BadgeCheck,
  Leaf,
  Pencil as PencilIcon,
  Package,
  Search,
  Trash2 as TrashIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const fallbackImage =
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop";

type SortField = "name" | "price" | "category";
type SortDir = "asc" | "desc";

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    price_half: "",
    image: "",
    is_available: true,
    is_popular: false,
    is_offer: false,
    veg: "unknown" as "veg" | "nonveg" | "unknown",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [removing, setRemoving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const refresh = useCallback(async () => {
    try {
      setProducts(await listProducts());
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sorted + filtered products
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "price") cmp = a.price - b.price;
      else cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [products, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="ml-1 size-3 inline opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 size-3 inline" />
    ) : (
      <ArrowDown className="ml-1 size-3 inline" />
    );
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      price_half: "",
      image: "",
      is_available: true,
      is_popular: false,
      is_offer: false,
      veg: "unknown",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description,
      price: String(p.price),
      price_half: p.price_half != null ? String(p.price_half) : "",
      image: p.image,
      is_available: p.is_available,
      is_popular: p.is_popular,
      is_offer: p.is_offer,
      veg: p.veg === undefined ? "unknown" : p.veg ? "veg" : "nonveg",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const price = Number(form.price);
      if (!form.name.trim() || !form.category.trim() || !Number.isFinite(price) || price < 0) {
        toast("Name, category and a valid price are required");
        return;
      }
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price,
        price_half: form.price_half.trim() ? Number(form.price_half) : undefined,
        image: form.image.trim() || fallbackImage,
        is_available: form.is_available,
        is_popular: form.is_popular,
        is_offer: form.is_offer,
        veg: form.veg === "unknown" ? null : form.veg === "veg",
      };
      if (editing) {
        await updateProduct(editing.id, payload);
        toast("Product updated");
      } else {
        await createProduct(payload);
        toast("Product added");
      }
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteProduct(deleting.id);
      toast("Product removed");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not remove product"));
    } finally {
      setRemoving(false);
    }
  };

  const syncFromMenu = async () => {
    setSyncing(true);
    try {
      const { createProduct: cp, updateProduct: up } = await import("@/lib/db");
      const menuData = await import("@/data/menu");

      // Build a map of existing products by lowercase name for quick lookup
      const existingByName = new Map(
        products.map((p) => [p.name.toLowerCase().trim(), p]),
      );

      let added = 0;
      let updated = 0;
      let skipped = 0;

      for (const item of menuData.menuItems) {
        const key = item.name.toLowerCase().trim();
        const existing = existingByName.get(key);

        if (existing) {
          // Update if price or image changed
          const needsUpdate =
            existing.price !== item.price ||
            existing.image !== item.image ||
            existing.category !== item.category ||
            existing.is_available !== (item.isAvailable ?? true);
          if (needsUpdate) {
            await up(existing.id, {
              price: item.price ?? 0,
              price_half: item.priceHalf ?? undefined,
              image: item.image,
              category: item.category,
              description: item.description,
              is_available: item.isAvailable ?? true,
              is_popular: item.isPopular ?? false,
              veg: item.veg,
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await cp({
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price ?? 0,
            price_half: item.priceHalf ?? undefined,
            image: item.image,
            is_available: item.isAvailable ?? true,
            is_popular: item.isPopular ?? false,
            is_offer: item.isOffer ?? false,
            veg: item.veg,
          });
          added++;
        }
      }

      toast(`Sync complete: ${added} added, ${updated} updated, ${skipped} unchanged`);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Sync failed"));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-4">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
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
          {products.length} item{products.length === 1 ? "" : "s"} on the menu
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={syncFromMenu}
            disabled={syncing}
            className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} />
            {syncing ? "Syncing..." : "Sync from menu"}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add product
          </Button>
        </div>
      </div>

      {/* Search + Sort */}
      {products.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 rounded-full border-border bg-background pl-9 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {(["name", "price", "category"] as SortField[]).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => toggleSort(field)}
                className={
                  "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors " +
                  (sortField === field
                    ? "border-gold bg-gold text-[#3a2403]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground")
                }
              >
                {field}
                <SortIcon field={field} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Package className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">No products yet.</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {displayed.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
                <span
                  className={
                    "absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider " +
                    (p.is_available
                      ? "border-green-500/50 bg-green-100 text-green-800"
                      : "border-red-500/50 bg-red-100 text-red-800")
                  }
                >
                  {p.is_available ? "Available" : "Sold out"}
                </span>
                <span className="absolute bottom-3 left-3 font-display text-2xl text-gold-bright">
                  ₹{p.price}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg uppercase leading-tight tracking-wide">
                    {p.name}
                  </h3>
                  <span className="flex shrink-0 gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => openEdit(p)}
                      aria-label={`Edit ${p.name}`}
                    >
                      <PencilIcon className="size-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-8 border-border text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.name}`}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.category}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3 text-[10px] font-bold uppercase tracking-wider">
                  {p.veg === true && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                      <Leaf className="size-3" /> Veg
                    </span>
                  )}
                  {p.veg === false && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-800">
                      <BadgeCheck className="size-3" /> Non-veg
                    </span>
                  )}
                  {p.is_popular && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                      Popular
                    </span>
                  )}
                  {p.is_offer && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">
                      Combo
                    </span>
                  )}
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
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Changes go live on the website menu instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Zayka Special Burger"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Burgers"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="129"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What makes this dish special..."
                rows={2}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-foreground/80">Image URL</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Type</Label>
              <Select
                value={form.veg}
                onValueChange={(v) => setForm({ ...form, veg: v as typeof form.veg })}
              >
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-vegetarian</SelectItem>
                  <SelectItem value="unknown">Not sure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Availability</Label>
              <Switch
                checked={form.is_available}
                onCheckedChange={(v) => setForm({ ...form, is_available: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Popular</Label>
              <Switch
                checked={form.is_popular}
                onCheckedChange={(v) => setForm({ ...form, is_popular: v })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Combo / Offer</Label>
              <Switch
                checked={form.is_offer}
                onCheckedChange={(v) => setForm({ ...form, is_offer: v })}
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
              {saving ? "Saving..." : editing ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">
              Remove product?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              "{deleting?.name}" will disappear from the website menu.
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
            <Button variant="destructive" onClick={confirmDelete} disabled={removing}>
              {removing ? "Removing..." : "Remove product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
