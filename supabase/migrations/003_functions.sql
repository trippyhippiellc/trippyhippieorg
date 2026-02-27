-- ============================================================
-- 003_functions.sql — Supabase DB Helper Functions & Triggers
-- Run after 001_initial_schema.sql and 002_rls_policies.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. AUTO-CREATE PROFILE ON SIGNUP
-- Fires after auth.users insert, creates a matching profile row.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    account_status
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 2. UPDATE updated_at TIMESTAMP AUTOMATICALLY
-- Applied to all tables that have an updated_at column.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all relevant tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','products','orders','reviews',
    'wholesale_applications','affiliate_applications',
    'state_laws','blog_posts','community_threads','community_replies'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 3. CALCULATE AFFILIATE COMMISSION ON ORDER INSERT
-- When an order is created with an affiliate_id, record 10%
-- commission in the affiliate_applications earnings total.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_affiliate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  commission_cents int;
BEGIN
  IF NEW.affiliate_id IS NULL THEN
    RETURN NEW;
  END IF;

  commission_cents := ROUND(NEW.total_cents * 0.10);

  UPDATE public.affiliate_applications
  SET total_earnings_cents = COALESCE(total_earnings_cents, 0) + commission_cents
  WHERE id = NEW.affiliate_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_affiliate_commission ON public.orders;
CREATE TRIGGER on_order_affiliate_commission
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.record_affiliate_commission();


-- ─────────────────────────────────────────────────────────────
-- 4. UPDATE PRODUCT AVERAGE RATING WHEN REVIEW IS APPROVED
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_rating numeric;
  review_count int;
BEGIN
  SELECT
    ROUND(AVG(rating)::numeric, 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'approved';

  UPDATE public.products
  SET
    average_rating = COALESCE(avg_rating, 0),
    review_count   = COALESCE(review_count, 0)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_update_rating ON public.reviews;
CREATE TRIGGER on_review_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();


-- ─────────────────────────────────────────────────────────────
-- 5. DECREMENT PRODUCT STOCK ON ORDER PLACED
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  line_item jsonb;
BEGIN
  -- Only act when status moves to 'processing' or higher
  IF NEW.status NOT IN ('processing','shipped','completed') THEN
    RETURN NEW;
  END IF;
  IF OLD.status IN ('processing','shipped','completed') THEN
    RETURN NEW; -- already decremented
  END IF;

  FOR line_item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - (line_item->>'quantity')::int)
    WHERE id = (line_item->>'product_id')::uuid;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_decrement_stock ON public.orders;
CREATE TRIGGER on_order_decrement_stock
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_order();


-- ─────────────────────────────────────────────────────────────
-- 6. HELPER VIEWS
-- ─────────────────────────────────────────────────────────────

-- Active products (public-safe view)
CREATE OR REPLACE VIEW public.active_products AS
  SELECT * FROM public.products
  WHERE is_active = TRUE AND stock_quantity > 0;

-- Approved affiliates lookup (used by coupon validation)
CREATE OR REPLACE VIEW public.approved_affiliates AS
  SELECT id, affiliate_code, user_id, total_earnings_cents
  FROM public.affiliate_applications
  WHERE status = 'approved';

-- ─────────────────────────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────────────────────────
