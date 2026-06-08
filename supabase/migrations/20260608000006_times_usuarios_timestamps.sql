-- 006 - Adiciona timestamps created_at e updated_at à tabela times_usuarios
-- A migração 001 adicionou esses campos apenas em elencos_usuarios.
-- Esta migração corrige o schema para times_usuarios também.

ALTER TABLE public.times_usuarios
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Trigger para manter updated_at atualizado em UPDATE
DROP TRIGGER IF EXISTS times_usuarios_touch ON public.times_usuarios;
CREATE TRIGGER times_usuarios_touch
  BEFORE UPDATE ON public.times_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at();
