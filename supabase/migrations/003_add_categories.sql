-- Add categories table for admin-managed menu category ordering
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Seed default categories
INSERT INTO categories (name, icon, sort_order) VALUES
  ('Specials', '⭐', 0),
  ('Burgers & Wraps', '🌯', 1),
  ('Pizza', '🍕', 2),
  ('Snacks & Sides', '🍟', 3),
  ('Chinese (H/F)', '🍜', 4),
  ('Rolls & Soups', '🫔', 5),
  ('Drinks & Desserts', '☕', 6)
ON CONFLICT (name) DO NOTHING;

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for authenticated" ON categories;
CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (true);
