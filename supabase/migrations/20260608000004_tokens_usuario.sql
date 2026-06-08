-- 004 - Tabela tokens_usuario
-- Cada time recebe 4 tokens ao ser criado: 1 capitão_triplo, 1 ajuste_rapido, 2 reconstruir.
-- O trigger seed_tokens_novo_time popula automaticamente em INSERT em times_usuarios.
-- O bloco final faz backfill idempotente para times já existentes (antes desta migration).
--
-- IMPORTANTE: times_usuarios.id é INTEGER (BIGINT), não UUID. A FK deve refletir isso.

CREATE TABLE IF NOT EXISTS public.tokens_usuario (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_usuario_id   BIGINT NOT NULL REFERENCES public.times_usuarios(id) ON DELETE CASCADE,
  tipo              TEXT NOT NULL
                      CHECK (tipo IN ('capitao_triplo', 'ajuste_rapido', 'reconstruir')),
  disponivel        BOOLEAN NOT NULL DEFAULT TRUE,
  usado_em          TIMESTAMPTZ,
  rodada_usado      INT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_usuario_time
  ON public.tokens_usuario (time_usuario_id);

CREATE INDEX IF NOT EXISTS idx_tokens_usuario_rodada_uso
  ON public.tokens_usuario (time_usuario_id, rodada_usado)
  WHERE usado_em IS NOT NULL;

DROP TRIGGER IF EXISTS trg_touch_updated_at ON public.tokens_usuario;
CREATE TRIGGER trg_touch_updated_at
  BEFORE UPDATE ON public.tokens_usuario
  FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at();

-- ====== RLS ======
ALTER TABLE public.tokens_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own tokens" ON public.tokens_usuario;
CREATE POLICY "Users see own tokens" ON public.tokens_usuario
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.times_usuarios t
      WHERE t.id = tokens_usuario.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE não são permitidos via cliente autenticado:
-- - INSERT acontece via trigger com SECURITY DEFINER (abaixo)
-- - UPDATE acontece via RPC usar_token (SECURITY DEFINER)
-- - DELETE em cascata pelo ON DELETE CASCADE

-- ====== Seed automático em novo time ======
CREATE OR REPLACE FUNCTION public.seed_tokens_novo_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tokens_usuario (time_usuario_id, tipo) VALUES
    (NEW.id, 'capitao_triplo'),
    (NEW.id, 'ajuste_rapido'),
    (NEW.id, 'reconstruir'),
    (NEW.id, 'reconstruir');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_tokens_novo_time ON public.times_usuarios;
CREATE TRIGGER trg_seed_tokens_novo_time
  AFTER INSERT ON public.times_usuarios
  FOR EACH ROW EXECUTE FUNCTION public.seed_tokens_novo_time();

-- ====== Backfill idempotente para times existentes ======
-- Para cada time já criado, garante que tem os 4 tokens esperados.

INSERT INTO public.tokens_usuario (time_usuario_id, tipo)
SELECT t.id, 'capitao_triplo'
FROM public.times_usuarios t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tokens_usuario tk
  WHERE tk.time_usuario_id = t.id AND tk.tipo = 'capitao_triplo'
);

INSERT INTO public.tokens_usuario (time_usuario_id, tipo)
SELECT t.id, 'ajuste_rapido'
FROM public.times_usuarios t
WHERE NOT EXISTS (
  SELECT 1 FROM public.tokens_usuario tk
  WHERE tk.time_usuario_id = t.id AND tk.tipo = 'ajuste_rapido'
);

-- 2 instâncias de reconstruir
INSERT INTO public.tokens_usuario (time_usuario_id, tipo)
SELECT t.id, 'reconstruir'
FROM public.times_usuarios t
WHERE (
  SELECT COUNT(*) FROM public.tokens_usuario tk
  WHERE tk.time_usuario_id = t.id AND tk.tipo = 'reconstruir'
) < 2;
