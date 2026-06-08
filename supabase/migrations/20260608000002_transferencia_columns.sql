-- 002 - Adiciona colunas de controle de transferências em times_usuarios
-- transferencias_gratis já existe (default 1) - controlada pelo backend/cron.
-- Novas colunas:
--   transferencias_extras_usadas     = total de transferências extras nesta temporada
--   pontos_penalidade_transferencia  = soma das penalidades (-5pts por extra) aplicadas
--   transferencias_total_rodada      = transferências feitas na rodada atual (reset por admin)

ALTER TABLE public.times_usuarios
  ADD COLUMN IF NOT EXISTS transferencias_extras_usadas    INT      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pontos_penalidade_transferencia NUMERIC  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transferencias_total_rodada     INT      NOT NULL DEFAULT 0;
