-- Add half-size price for items with dual H/F pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_half NUMERIC;
