ALTER TABLE public.seasonal_themes
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'neutral',
  ADD COLUMN IF NOT EXISTS banner_message text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS cta_path text,
  ADD COLUMN IF NOT EXISTS show_on_reseller boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_on_storefront boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.seasonal_themes ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

GRANT SELECT ON public.seasonal_themes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seasonal_themes TO authenticated;
GRANT ALL ON public.seasonal_themes TO service_role;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_seasonal_themes_updated_at ON public.seasonal_themes;
CREATE TRIGGER update_seasonal_themes_updated_at
BEFORE UPDATE ON public.seasonal_themes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();