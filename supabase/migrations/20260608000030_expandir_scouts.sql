-- Expande scouts_atleta_rodada com novas colunas de estatísticas
-- para alinhar com as regras descritas em regras_fantasy.md

ALTER TABLE public.scouts_atleta_rodada
  ADD COLUMN IF NOT EXISTS defesas             INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interceptacoes      INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chutes_bloqueados   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duelos_vencidos     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duelos_tentados     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dribles_certos      INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dribles_tentados    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bolas_longas_certas       INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bolas_longas_tentadas     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS faltas_sofridas     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impedimentos        INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalti_defendido   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalti_perdido     INT NOT NULL DEFAULT 0;
