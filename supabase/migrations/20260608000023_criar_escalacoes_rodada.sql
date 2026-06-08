-- Cria tabela de escalação (11 titulares + capitão + formação por rodada)
-- e atualiza fechar_mercado_rodada para incluir escalações no snapshot.

CREATE TABLE IF NOT EXISTS public.escalacoes_rodada (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_usuario_id BIGINT NOT NULL REFERENCES public.times_usuarios(id) ON DELETE CASCADE,
  rodada          INT NOT NULL,
  jogador_id      BIGINT NOT NULL REFERENCES public.jogadores(id_sofascore),
  eh_titular      BOOLEAN NOT NULL DEFAULT FALSE,
  eh_capitao      BOOLEAN NOT NULL DEFAULT FALSE,
  formacao        TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (time_usuario_id, rodada, jogador_id)
);

ALTER TABLE public.escalacoes_rodada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem suas escalacoes"
  ON public.escalacoes_rodada FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.times_usuarios t
      WHERE t.id = escalacoes_rodada.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios inserem suas escalacoes"
  ON public.escalacoes_rodada FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.times_usuarios t
      WHERE t.id = escalacoes_rodada.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.escalacoes_rodada TO authenticated;

-- Adicionar colunas de escalação no snapshot
ALTER TABLE public.elenco_snapshot_rodada
  ADD COLUMN IF NOT EXISTS eh_titular BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS formacao TEXT NOT NULL DEFAULT '';

-- Atualizar fechar_mercado_rodada para incluir escalações no snapshot
CREATE OR REPLACE FUNCTION public.fechar_mercado_rodada()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rodada INT;
BEGIN
  SELECT rodada_atual INTO v_rodada FROM public.config_rodada WHERE id = 1;

  UPDATE public.config_rodada
  SET mercado_aberto = FALSE, updated_at = NOW()
  WHERE id = 1;

  -- Snapshot do elenco (15 jogadores) + dados de escalação (11 titulares + capitão + formação)
  INSERT INTO public.elenco_snapshot_rodada (time_usuario_id, rodada, jogador_id, eh_capitao, eh_titular, formacao)
  SELECT
    eu.time_usuario_id,
    v_rodada,
    eu.jogador_id,
    COALESCE(er.eh_capitao, eu.eh_capitao, FALSE),
    COALESCE(er.eh_titular, FALSE),
    COALESCE(er.formacao, '')
  FROM public.elencos_usuarios eu
  LEFT JOIN public.escalacoes_rodada er
    ON er.time_usuario_id = eu.time_usuario_id
   AND er.rodada = v_rodada
   AND er.jogador_id = eu.jogador_id
  ON CONFLICT (time_usuario_id, rodada, jogador_id) DO UPDATE
  SET eh_capitao = EXCLUDED.eh_capitao,
      eh_titular = EXCLUDED.eh_titular,
      formacao   = EXCLUDED.formacao;

  RETURN jsonb_build_object('rodada', v_rodada, 'mercado_aberto', FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fechar_mercado_rodada() TO service_role;
