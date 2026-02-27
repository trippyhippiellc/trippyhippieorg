-- Add Cash App payment verification columns to orders table
ALTER TABLE IF EXISTS public.orders
ADD COLUMN IF NOT EXISTS cashapp_tag TEXT,
ADD COLUMN IF NOT EXISTS cashapp_timestamp TEXT,
ADD COLUMN IF NOT EXISTS cashapp_transaction_id TEXT;
