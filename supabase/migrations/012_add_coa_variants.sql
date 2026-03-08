-- Add support for variant selection in COA requests
-- This allows requesting COAs for specific product variants

-- Add new column to store product + variant information
ALTER TABLE IF EXISTS public.coa_requests
ADD COLUMN IF NOT EXISTS requested_products JSONB DEFAULT NULL;

-- Set existing requests to have null requested_products (backwards compatible)
-- When frontend sends old format (requestedProductIds), it will be converted to new format
UPDATE public.coa_requests 
SET requested_products = NULL
WHERE requested_products IS NULL;
