-- Migration: Add state_restrictions to products table
-- Allows per-product state-level restrictions for compliance
-- null = no restrictions (ship to all states)
-- Array of state codes = product restricted in those states

ALTER TABLE products
ADD COLUMN IF NOT EXISTS state_restrictions text[] DEFAULT NULL;

COMMENT ON COLUMN products.state_restrictions IS 'Array of state codes where product is restricted (null = no restrictions). Example: ["CA","WV"]. Used to hide products from users in restricted states.';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_state_restrictions ON products USING GIN(state_restrictions);
