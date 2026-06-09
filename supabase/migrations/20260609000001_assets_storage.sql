-- Cria bucket público 'assets' para fotos de jogadores e bandeiras
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('assets', 'assets', true, false)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública para o bucket assets
DROP POLICY IF EXISTS "Public read assets" ON storage.objects;
CREATE POLICY "Public read assets" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'assets');

-- Política de escrita apenas para service_role (admin)
-- O upload é feito pelo script Python com SUPABASE_SERVICE_ROLE_KEY
DROP POLICY IF EXISTS "Admin write assets" ON storage.objects;
CREATE POLICY "Admin write assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assets'
    AND auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "Admin update assets" ON storage.objects;
CREATE POLICY "Admin update assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assets'
    AND auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'assets'
    AND auth.role() = 'service_role'
  );
