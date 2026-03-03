-- Add cashapp_approved column to profiles table for approving users to use Cash App payments
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS cashapp_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.cashapp_approved IS 'Boolean flag to indicate if a user is approved to use Cash App as a payment method. Default is false (disabled for all).';
