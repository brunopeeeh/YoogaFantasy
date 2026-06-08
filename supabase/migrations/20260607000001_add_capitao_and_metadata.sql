-- 001 - Adiciona coluna de capitão, timestamps e constraint de unicidade
-- Aplicar antes de qualquer RLS / RPC.

ALTER TABLE elencos_usuarios
  ADD COLUMN IF NOT EXISTS eh_capitao BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Garante no máximo 1 capitão por time
CREATE UNIQUE INDEX IF NOT EXISTS unico_capitao_por_time
  ON elencos_usuarios (time_usuario_id)
  WHERE eh_capitao = TRUE;

-- Trigger genérico para manter updated_at em updates
CREATE OR REPLACE FUNCTION trg_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS elencos_usuarios_touch ON elencos_usuarios;
CREATE TRIGGER elencos_usuarios_touch
  BEFORE UPDATE ON elencos_usuarios
  FOR EACH ROW EXECUTE FUNCTION trg_touch_updated_at();
