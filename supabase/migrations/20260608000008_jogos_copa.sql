CREATE TABLE IF NOT EXISTS public.jogos_copa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_sofascore BIGINT UNIQUE NOT NULL,
    rodada_numero INTEGER NOT NULL,
    grupo_rodada TEXT NOT NULL,
    time_casa_id BIGINT REFERENCES public.selecoes(id) NOT NULL,
    time_fora_id BIGINT REFERENCES public.selecoes(id) NOT NULL,
    timestamp_bruto BIGINT,
    data_local_brt TEXT
);

-- Habilitar RLS e permitir leitura pública (todos os usuários do app podem ver os jogos)
ALTER TABLE public.jogos_copa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de jogos"
    ON public.jogos_copa FOR SELECT
    USING (true);
