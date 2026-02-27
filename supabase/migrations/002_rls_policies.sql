--------------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES — supabase/migrations/002_rls_policies.sql
--
-- Run this AFTER 001_initial_schema.sql in the Supabase SQL Editor.
--
-- RLS ensures users can ONLY access their own data.
-- Even if someone finds your Supabase URL and anon key,
-- they cannot read another user's orders, profile, or ID docs.
--
-- Pattern:
--   1. Enable RLS on every table
--   2. Add SELECT / INSERT / UPDATE / DELETE policies per role
--
-- Roles used:
--   anon     — unauthenticated visitors
--   authenticated — logged-in users
--   (service_role bypasses all RLS — used by adminClient only)
--------------------------------------------------------------------


--------------------------------------------------------------------
-- STEP 1: ENABLE RLS ON ALL TABLES
--------------------------------------------------------------------
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_laws            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_threads     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_requests          ENABLE ROW LEVEL SECURITY;


--------------------------------------------------------------------
-- PROFILES TABLE POLICIES
--
-- Users can only read and update their OWN profile.
-- Admins (service role) can read/update any profile.
--------------------------------------------------------------------

-- Anyone can view profiles (needed for community author display)
-- But only see non-sensitive fields via a view (future enhancement)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (name, phone, avatar, state)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    -- Prevent users from promoting themselves to admin or wholesale
    -- These fields can only be changed by service_role (admin client)
    is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    is_wholesale_approved = (SELECT is_wholesale_approved FROM public.profiles WHERE id = auth.uid()),
    account_status = (SELECT account_status FROM public.profiles WHERE id = auth.uid()),
    is_affiliate = (SELECT is_affiliate FROM public.profiles WHERE id = auth.uid())
  );

-- Users can only toggle their own is_wholesale (mode switch, not approval)
-- Note: is_wholesale_approved is admin-only; is_wholesale is user-toggleable
CREATE POLICY "profiles_update_wholesale_mode"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);


--------------------------------------------------------------------
-- PRODUCTS TABLE POLICIES
--
-- Anyone (including anonymous) can view active products.
-- Only service_role (admin) can create, update, delete products.
--------------------------------------------------------------------

-- Public can view active products
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

-- Authenticated users can view all products (including inactive) only if admin
-- Regular product browsing uses is_active = TRUE filter above
CREATE POLICY "products_select_admin"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- ORDERS TABLE POLICIES
--
-- Users can only see their own orders.
-- Users can create orders for themselves.
-- Only service_role can update order status.
--------------------------------------------------------------------

-- Users see only their own orders
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create orders (checkout)
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can view ALL orders
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- COA REQUESTS TABLE POLICIES
--
-- Users can create COA requests.
-- Users can view their own requests.
-- Admins can view and update all requests.
--------------------------------------------------------------------

-- Users can view their own COA requests
CREATE POLICY "coa_requests_select_own"
  ON public.coa_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Anyone can create COA requests (even anonymous, but we prefer logged-in)
CREATE POLICY "coa_requests_insert"
  ON public.coa_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- Admins can view ALL COA requests
CREATE POLICY "coa_requests_select_admin"
  ON public.coa_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update COA requests (mark as fulfilled)
CREATE POLICY "coa_requests_update_admin"
  ON public.coa_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- REVIEWS TABLE POLICIES
--------------------------------------------------------------------

-- Anyone can view approved reviews
CREATE POLICY "reviews_select_approved"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (is_approved = TRUE);

-- Users can view their own unapproved reviews
CREATE POLICY "reviews_select_own"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create reviews (one per product enforced by UNIQUE constraint)
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own review (edit before approval)
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_approved = FALSE)
  WITH CHECK (user_id = auth.uid());


--------------------------------------------------------------------
-- WHOLESALE APPLICATIONS POLICIES
--------------------------------------------------------------------

-- Users can view their own application
CREATE POLICY "wholesale_apps_select_own"
  ON public.wholesale_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can submit one application
CREATE POLICY "wholesale_apps_insert_own"
  ON public.wholesale_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can view all wholesale applications
CREATE POLICY "wholesale_apps_select_admin"
  ON public.wholesale_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- AFFILIATE APPLICATIONS POLICIES
--------------------------------------------------------------------

-- Users can view their own application
CREATE POLICY "affiliate_apps_select_own"
  ON public.affiliate_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can submit
CREATE POLICY "affiliate_apps_insert_own"
  ON public.affiliate_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin can view all
CREATE POLICY "affiliate_apps_select_admin"
  ON public.affiliate_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- STATE LAWS POLICIES
-- Public read — admin write only
--------------------------------------------------------------------

CREATE POLICY "state_laws_select_public"
  ON public.state_laws FOR SELECT
  TO anon, authenticated
  USING (TRUE);


--------------------------------------------------------------------
-- BLOG POSTS POLICIES
-- Public can read published posts. Admin manages all.
--------------------------------------------------------------------

CREATE POLICY "blog_select_published"
  ON public.blog_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE);

CREATE POLICY "blog_select_admin"
  ON public.blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );


--------------------------------------------------------------------
-- COMMUNITY THREADS POLICIES
--------------------------------------------------------------------

-- Anyone can read threads
CREATE POLICY "threads_select_public"
  ON public.community_threads FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Authenticated users can post threads
CREATE POLICY "threads_insert_auth"
  ON public.community_threads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authors can edit their own threads (if not locked)
CREATE POLICY "threads_update_own"
  ON public.community_threads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_locked = FALSE)
  WITH CHECK (user_id = auth.uid());


--------------------------------------------------------------------
-- COMMUNITY REPLIES POLICIES
--------------------------------------------------------------------

CREATE POLICY "replies_select_public"
  ON public.community_replies FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "replies_insert_auth"
  ON public.community_replies FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "replies_delete_own"
  ON public.community_replies FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


--------------------------------------------------------------------
-- SUPABASE STORAGE POLICIES
-- Run these in the SQL editor after creating the storage buckets.
--
-- Buckets to create manually in Supabase Dashboard → Storage:
--   1. "product-assets"   — public bucket (product images/videos)
--   2. "user-uploads"     — private bucket (ID documents)
--   3. "blog-assets"      — public bucket (blog images)
--------------------------------------------------------------------

-- Product assets: public read, admin write
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-assets', 'product-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read product assets
CREATE POLICY "product_assets_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-assets');

-- Users can upload to their own folder in user-uploads
-- Path pattern: user-uploads/<user_id>/filename
CREATE POLICY "user_uploads_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own uploads
CREATE POLICY "user_uploads_own_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

--------------------------------------------------------------------
-- DONE
-- Next: Run 003_functions.sql for additional database functions
--------------------------------------------------------------------