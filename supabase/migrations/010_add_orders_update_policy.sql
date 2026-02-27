-- Add UPDATE policy for orders table to allow admin/service role updates
-- This allows admins to update order status and payment verification details

CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
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
