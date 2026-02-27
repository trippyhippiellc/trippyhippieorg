--------------------------------------------------------------------
-- INITIAL SCHEMA — supabase/migrations/001_initial_schema.sql
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- or via the Supabase CLI: supabase db push
--
-- This creates ALL tables for the Trippy Hippie platform.
-- Run in this order — foreign key dependencies matter.
--
-- ORDER:
--   1. Extensions
--   2. Enums
--   3. profiles (depends on auth.users)
--   4. products
--   5. orders (depends on profiles)
--   6. reviews (depends on profiles, products)
--   7. wholesale_applications (depends on profiles)
--   8. affiliate_applications (depends on profiles)
--   9. state_laws
--  10. blog_posts (depends on profiles)
--  11. community_threads (depends on profiles)
--  12. community_replies (depends on profiles, community_threads)
--  13. Triggers (auto-create profile on signup, etc.)
--------------------------------------------------------------------


--------------------------------------------------------------------
-- STEP 1: EXTENSIONS
-- Enable UUID generation and other helpers
--------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


--------------------------------------------------------------------
-- STEP 2: CUSTOM TYPES (ENUMS)
-- Reusable named types for status fields
-- Note: If you re-run this, the DO blocks prevent errors
--------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('processing', 'pending', 'shipped', 'completed', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('stripe', 'crypto', 'cashapp', 'wire');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('flower', 'vape', 'edible', 'accessory', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE strain_type AS ENUM ('sativa', 'indica', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


--------------------------------------------------------------------
-- STEP 3: PROFILES TABLE
-- Extended user data linked to Supabase Auth.
-- id = auth.users.id (UUID, not auto-generated here)
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  phone                 TEXT,
  avatar_url            TEXT,

  -- Account approval workflow
  account_status        account_status NOT NULL DEFAULT 'pending',
  id_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  id_document_url       TEXT,

  -- Roles
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,

  -- Wholesale
  is_wholesale_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_wholesale          BOOLEAN NOT NULL DEFAULT FALSE,  -- Currently viewing wholesale prices

  -- Affiliates
  is_affiliate          BOOLEAN NOT NULL DEFAULT FALSE,
  affiliate_code        TEXT UNIQUE,                    -- Their unique coupon code
  affiliate_earnings    INTEGER NOT NULL DEFAULT 0,     -- Unpaid earnings in cents

  -- State compliance
  selected_state        CHAR(2),                        -- Two-letter state code

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast affiliate code lookups at checkout
CREATE INDEX IF NOT EXISTS idx_profiles_affiliate_code ON public.profiles(affiliate_code);

-- Index for admin user list queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);


--------------------------------------------------------------------
-- STEP 4: PRODUCTS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  category          product_category NOT NULL,
  subcategory       TEXT,
  strain_type       strain_type,
  thca_percentage   DECIMAL(5,2),           -- e.g., 22.50 for 22.50%

  -- Pricing (all in cents)
  price_retail      INTEGER NOT NULL,
  price_wholesale   INTEGER NOT NULL,
  price_compare     INTEGER,                -- Original price before sale

  -- Inventory
  stock_quantity    INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Media
  images            TEXT[] NOT NULL DEFAULT '{}',
  video_url         TEXT,
  model_url         TEXT,                   -- 3D .glb model URL

  -- Metadata
  weight_grams      DECIMAL(10,2),
  tags              TEXT[] NOT NULL DEFAULT '{}',

  -- State compliance: NULL = ships to all states, or list of allowed state codes
  allowed_states    CHAR(2)[],

  -- Bulk pricing tiers stored as JSONB array
  -- Example: [{"quantity": 2, "discount_percent": 10, "label": "Buy 2, Save 10%"}]
  bulk_tiers        JSONB,

  -- Computed from reviews (updated by trigger)
  average_rating    DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);


--------------------------------------------------------------------
-- STEP 5: ORDERS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          TEXT NOT NULL UNIQUE,           -- Human readable: TH-20240101-0001
  user_id               UUID NOT NULL REFERENCES public.profiles(id),

  -- Status
  status                order_status NOT NULL DEFAULT 'processing',
  payment_method        payment_method NOT NULL,
  payment_status        payment_status NOT NULL DEFAULT 'unpaid',

  -- Payment provider references
  payment_intent_id     TEXT,                           -- Stripe payment intent
  crypto_invoice_id     TEXT,                           -- NOWPayments invoice

  -- Pricing context
  is_wholesale          BOOLEAN NOT NULL DEFAULT FALSE,

  -- Amounts (all in cents)
  subtotal              INTEGER NOT NULL,               -- Sum of items before discounts
  discount_amount       INTEGER NOT NULL DEFAULT 0,     -- Coupon discount
  coupon_code           TEXT,
  affiliate_id          UUID REFERENCES public.profiles(id),
  affiliate_commission  INTEGER NOT NULL DEFAULT 0,     -- 10% of subtotal to affiliate
  shipping_cost         INTEGER NOT NULL DEFAULT 0,
  tax_amount            INTEGER NOT NULL DEFAULT 0,
  total                 INTEGER NOT NULL,               -- Final charged amount

  -- Shipping details
  shipping_address      JSONB NOT NULL,

  -- Line items snapshot (frozen at time of order)
  items                 JSONB NOT NULL,

  -- Admin notes + tracking
  notes                 TEXT,
  tracking_number       TEXT,
  shipped_at            TIMESTAMPTZ,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);


--------------------------------------------------------------------
-- STEP 6: REVIEWS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title         TEXT,
  body          TEXT,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,         -- Admin approves before display
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One review per user per product
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);


--------------------------------------------------------------------
-- STEP 7: WHOLESALE APPLICATIONS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wholesale_applications (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES public.profiles(id),
  business_name             TEXT NOT NULL,
  business_type             TEXT NOT NULL,              -- LLC, Sole Prop, etc.
  ein_number                TEXT,
  estimated_monthly_volume  TEXT NOT NULL,              -- "$5k-10k" etc.
  years_in_business         TEXT NOT NULL,
  website_url               TEXT,
  references                TEXT,
  reason                    TEXT NOT NULL,              -- Why do they want wholesale?
  status                    application_status NOT NULL DEFAULT 'pending',
  admin_notes               TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wholesale_apps_user_id ON public.wholesale_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_apps_status ON public.wholesale_applications(status);


--------------------------------------------------------------------
-- STEP 8: AFFILIATE APPLICATIONS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliate_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  full_name       TEXT NOT NULL,
  platform        TEXT NOT NULL,                        -- Instagram, TikTok, YouTube, etc.
  handle          TEXT NOT NULL,
  follower_count  TEXT NOT NULL,
  content_type    TEXT NOT NULL,
  promotion_plan  TEXT NOT NULL,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  status          application_status NOT NULL DEFAULT 'pending',
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_apps_user_id ON public.affiliate_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_apps_status ON public.affiliate_applications(status);


--------------------------------------------------------------------
-- STEP 9: STATE LAWS TABLE
-- Controls what products are visible in each state
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.state_laws (
  state_code            CHAR(2) PRIMARY KEY,
  state_name            TEXT NOT NULL,
  allows_thca_flower    BOOLEAN NOT NULL DEFAULT TRUE,
  allows_vapes          BOOLEAN NOT NULL DEFAULT TRUE,
  allows_edibles        BOOLEAN NOT NULL DEFAULT TRUE,
  allows_accessories    BOOLEAN NOT NULL DEFAULT TRUE,
  shipping_allowed      BOOLEAN NOT NULL DEFAULT TRUE,
  notes                 TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed with all 50 states — all enabled by default.
-- Adjust as needed for compliance.
INSERT INTO public.state_laws (state_code, state_name) VALUES
  ('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'), ('AR', 'Arkansas'),
  ('CA', 'California'), ('CO', 'Colorado'), ('CT', 'Connecticut'), ('DE', 'Delaware'),
  ('FL', 'Florida'), ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'),
  ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'), ('KS', 'Kansas'),
  ('KY', 'Kentucky'), ('LA', 'Louisiana'), ('ME', 'Maine'), ('MD', 'Maryland'),
  ('MA', 'Massachusetts'), ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'),
  ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'), ('NV', 'Nevada'),
  ('NH', 'New Hampshire'), ('NJ', 'New Jersey'), ('NM', 'New Mexico'), ('NY', 'New York'),
  ('NC', 'North Carolina'), ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'),
  ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'), ('SC', 'South Carolina'),
  ('SD', 'South Dakota'), ('TN', 'Tennessee'), ('TX', 'Texas'), ('UT', 'Utah'),
  ('VT', 'Vermont'), ('VA', 'Virginia'), ('WA', 'Washington'), ('WV', 'West Virginia'),
  ('WI', 'Wisconsin'), ('WY', 'Wyoming')
ON CONFLICT (state_code) DO NOTHING;

-- Mark known restricted states for THCa flower
UPDATE public.state_laws
SET allows_thca_flower = FALSE, notes = 'THCa flower not permitted'
WHERE state_code IN ('ID', 'MS', 'MN', 'OR', 'RI');


--------------------------------------------------------------------
-- STEP 10: BLOG POSTS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT,
  content         TEXT NOT NULL,
  cover_image_url TEXT,
  author_id       UUID NOT NULL REFERENCES public.profiles(id),
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);


--------------------------------------------------------------------
-- STEP 11: COMMUNITY THREADS TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  reply_count INTEGER NOT NULL DEFAULT 0,
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_created ON public.community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_category ON public.community_threads(category);


--------------------------------------------------------------------
-- STEP 12: COMMUNITY REPLIES TABLE
--------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_replies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_replies_thread_id ON public.community_replies(thread_id);


--------------------------------------------------------------------
-- STEP 13: TRIGGERS
--------------------------------------------------------------------

-- TRIGGER 1: Auto-create a profile row when a new user signs up
-- This fires after INSERT on auth.users (Supabase built-in table)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- TRIGGER 2: Auto-update updated_at timestamp on profile changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all relevant tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- TRIGGER 3: Recompute product average rating after review insert/update/delete
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_product_id UUID;
BEGIN
  -- Determine which product was affected
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  -- Recompute and store average + count (approved reviews only)
  UPDATE public.products
  SET
    average_rating = COALESCE((
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = TRUE
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = target_product_id AND is_approved = TRUE
    )
  WHERE id = target_product_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();


-- TRIGGER 4: Increment community thread reply count on new reply
CREATE OR REPLACE FUNCTION public.increment_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_threads
    SET reply_count = reply_count + 1, updated_at = NOW()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_threads
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_reply_change ON public.community_replies;
CREATE TRIGGER on_reply_change
  AFTER INSERT OR DELETE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.increment_reply_count();


--------------------------------------------------------------------
-- STEP 14: HELPER FUNCTIONS
--------------------------------------------------------------------

-- Generate a human-readable order number: TH-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  date_part TEXT;
  seq_part  TEXT;
  count_today INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COUNT(*) + 1 INTO count_today
  FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE;

  seq_part := LPAD(count_today::TEXT, 4, '0');

  RETURN 'TH-' || date_part || '-' || seq_part;
END;
$$;


-- Increment affiliate earnings safely (called from API route after order)
CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(
  affiliate_id UUID,
  amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET affiliate_earnings = affiliate_earnings + amount
  WHERE id = affiliate_id;
END;
$$;


--------------------------------------------------------------------
-- DONE
-- Next: Run 002_rls_policies.sql to lock down row access
--------------------------------------------------------------------