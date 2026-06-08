-- 001 - Tabela singleton config_rodada
-- Armazena o estado do "mercado" (aberto/fechado) e o deadline da rodada atual.
-- Leitura pública, escrita via service_role (admin).

CREATE TABLE IF NOT EXISTS public.config_rodada (
  id              INT         PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  rodada_atual    INT         NOT NULL DEFAULT 1,
  deadline        TIMESTAMPTZ NOT NULL,
  mercado_aberto  BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger genérico de updated_at (criado em 001 do P1; redeclara idempotente)
CREATE OR REPLACE FUNCTION public.trg_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS config_rodada_touch ON public.config_rodada;
CREATE TRIGGER config_rodada_touch
  BEFORE UPDATE ON public.config_rodada
  FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at();

-- Seed: rodada 1, deadline em 7 dias, mercado aberto
INSERT INTO public.config_rodada (id, rodada_atual, deadline, mercado_aberto)
VALUES (1, 1, NOW() + INTERVAL '7 days', TRUE)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.config_rodada ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read config_rodada" ON public.config_rodada;
CREATE POLICY "Public read config_rodada" ON public.config_rodada
  FOR SELECT USING (TRUE);

-- Escrita apenas pelo service_role (usado pelo backend Python / cron)
-- Não criamos policy de INSERT/UPDATE/DELETE para authenticated → RLS bloqueia por padrão.
