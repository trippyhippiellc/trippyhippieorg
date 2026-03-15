-- Migration: Add Smoke Shop Wholesale feature
-- Description: Adds support for a separate smoke shop wholesale tier with dedicated pricing

-- Add is_smokeshop_wholesale column to profiles table
alter table public.profiles
add column is_smokeshop_wholesale boolean not null default false;

-- Create index for quick lookups of smoke shop wholesale users
create index if not exists idx_profiles_is_smokeshop_wholesale 
on public.profiles using btree (is_smokeshop_wholesale) 
tablespace pg_default;

-- Add is_smokeshop_wholesale column to products table
alter table public.products
add column is_smokeshop_wholesale boolean not null default false;

-- Add price_smokeshop_wholesale column to products table (stored in cents)
alter table public.products
add column price_smokeshop_wholesale integer null;

-- Create indexes for smoke shop wholesale products
create index if not exists idx_products_is_smokeshop_wholesale 
on public.products using btree (is_smokeshop_wholesale) 
tablespace pg_default;

create index if not exists idx_products_is_smokeshop_wholesale_active 
on public.products using btree (is_smokeshop_wholesale, is_active) 
tablespace pg_default;

-- Optional: Add comment for documentation
comment on column public.profiles.is_smokeshop_wholesale is 'True if user has access to the smoke shop wholesale tier (separate from regular wholesale)';
comment on column public.products.is_smokeshop_wholesale is 'True if product is a smoke shop wholesale exclusive product';
comment on column public.products.price_smokeshop_wholesale is 'Special pricing for smoke shop wholesale products (in cents)';
