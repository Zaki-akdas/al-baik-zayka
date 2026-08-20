import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  type Category,
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { friendlyErrorMessage } from "@/lib/utils";

const EMOJI_PICK = [
  "\u2b50", "\ud83c\udf54", "\ud83c\udf2f", "\ud83c\udf55", "\ud83c\udf5f",
  "\ud83c\udf5c", "\ud83e\uded2", "\u2615", "\ud83e\udd64", "\ud83c\udf70",
  "\ud83c\udf2e", "\ud83e\uddc0", "\ud83c\udf57", "\ud83e\udd57", "\ud83c\udf5d",
  "\ud83e\uddee", "\ud83e\uddca", "\ud83e\uddc1", "\ud83c\udf73", "\ud83c\udf89",
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setCategories(await listCategories());
    } catch (err) {
      toast(friendlyErrorMessage(err, "Failed to load categories"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [removing, setRemoving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setIcon("");
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon ?? "");
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (!name.trim()) {
        toast("Category name is required");
        return;
      }
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
          icon: icon.trim() || null,
        });
        toast("Category updated");
      } else {
        const maxSort = categories.reduce((m, c) => Math.max(m, c.sort_order), -1);
        await createCategory({
          name: name.trim(),
          icon: icon.trim() || null,
          sort_order: maxSort + 1,
        });
        toast("Category added");
      }
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not save category"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteCategory(deleting.id);
      toast("Category removed");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast(friendlyErrorMessage(err, "Could not remove category"));
    } finally {
      setRemoving(false);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const reordered = [...categories];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setCategories(reordered);
    await reorderCategories(reordered.map((c) => c.id));
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setCategories(reordered);
    reorderCategories(reordered.map((c) => c.id)).catch((err: unknown) =>
      toast(friendlyErrorMessage(err, "Reorder failed")),
    );
    setDragIdx(idx);
  };

  const handleDragEnd = () => setDragIdx(null);

  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading categories...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} on the menu
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No categories yet. Add your first one.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c, idx) => (
            <div
              key={c.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={
                "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors " +
                (dragIdx === idx ? "opacity-50" : "")
              }
            >
              <span className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing">
                <GripVertical className="size-5" />
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-xl">
                {c.icon ?? "\ud83d\udcc1"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">Order: {c.sort_order}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={idx === 0} onClick={() => move(idx, -1)} aria-label="Move up"
                >&#8593;</Button>
                <Button
                  variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground"
                  disabled={idx === categories.length - 1} onClick={() => move(idx, 1)} aria-label="Move down"
                >&#8595;</Button>
                <Button
                  variant="outline" size="icon-sm"
                  className="size-8 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}
                ><Pencil className="size-3.5" /></Button>
                <Button
                  variant="outline" size="icon-sm"
                  className="size-8 border-border text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}
                ><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">
              {editing ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Categories appear as filter tabs on the customer menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Name</Label>
              <Input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Burgers & Wraps"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Emoji icon</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_PICK.map((e) => (
                  <button
                    key={e} type="button" onClick={() => setIcon(icon === e ? "" : e)}
                    className={
                      "flex size-10 items-center justify-center rounded-xl border text-xl transition-all " +
                      (icon === e ? "border-maroon bg-maroon/10" : "border-border bg-card hover:bg-muted")
                    }
                  >{e}</button>
                ))}
              </div>
              <Input
                value={icon} onChange={(e) => setIcon(e.target.value)}
                placeholder="Or type any emoji"
                className="mt-2 border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(open) => { if (!open) setDeleting(null); }}>
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl uppercase tracking-wide">Remove category?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              &ldquo;{deleting?.name}&rdquo; will be removed from the filter tabs. Products keep their category label.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}
              className="border-border text-foreground/80 hover:bg-muted hover:text-foreground"
            >Keep it</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={removing}>
              {removing ? "Removing..." : "Remove category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
