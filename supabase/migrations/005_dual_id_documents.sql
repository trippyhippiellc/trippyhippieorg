--------------------------------------------------------------------
-- MIGRATION 004: Add Dual ID Document Fields
-- Supports uploading both front and back of ID card for verification
--------------------------------------------------------------------

-- Add new columns for front and back ID documents
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS id_document_url_front TEXT,
ADD COLUMN IF NOT EXISTS id_document_url_back TEXT;

-- Keep the old column for backward compatibility (will be deprecated)
-- If you want to migrate old data later, you can do:
-- UPDATE profiles SET id_document_url_front = id_document_url WHERE id_document_url IS NOT NULL;
