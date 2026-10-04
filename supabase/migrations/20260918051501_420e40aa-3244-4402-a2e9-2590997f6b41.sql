ALTER TABLE public.reseller_profiles
  ADD COLUMN IF NOT EXISTS profile_picture text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS shop_logo text,
  ADD COLUMN IF NOT EXISTS shop_hero_banner text,
  ADD COLUMN IF NOT EXISTS store_theme text DEFAULT 'minimal';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone text;