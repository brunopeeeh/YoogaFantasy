-- Ligas privadas, perfis públicos e RPC de leaderboard

CREATE TABLE IF NOT EXISTS public.perfis_usuario (
  usuario_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_exibicao  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS perfis_usuario_touch ON public.perfis_usuario;
CREATE TRIGGER perfis_usuario_touch
  BEFORE UPDATE ON public.perfis_usuario
  FOR EACH ROW EXECUTE FUNCTION public.trg_touch_updated_at();

ALTER TABLE public.perfis_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read perfis" ON public.perfis_usuario;
CREATE POLICY "Public read perfis" ON public.perfis_usuario
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users manage own perfil" ON public.perfis_usuario;
CREATE POLICY "Users manage own perfil" ON public.perfis_usuario
  FOR ALL USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE TABLE IF NOT EXISTS public.ligas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  tipo           TEXT NOT NULL DEFAULT 'privada' CHECK (tipo IN ('privada', 'publica')),
  codigo_convite TEXT UNIQUE,
  criado_por     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ligas_codigo ON public.ligas (codigo_convite);

ALTER TABLE public.ligas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read ligas" ON public.ligas;
CREATE POLICY "Authenticated read ligas" ON public.ligas
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Users create ligas" ON public.ligas;
CREATE POLICY "Users create ligas" ON public.ligas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = criado_por);

CREATE TABLE IF NOT EXISTS public.usuarios_ligas (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liga_id            UUID NOT NULL REFERENCES public.ligas(id) ON DELETE CASCADE,
  usuario_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pontos_acumulados  NUMERIC NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (liga_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_ligas_liga ON public.usuarios_ligas (liga_id, pontos_acumulados DESC);

ALTER TABLE public.usuarios_ligas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read league standings" ON public.usuarios_ligas;
CREATE POLICY "Members read league standings" ON public.usuarios_ligas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_ligas ul
      WHERE ul.liga_id = usuarios_ligas.liga_id
        AND ul.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users join leagues" ON public.usuarios_ligas;
CREATE POLICY "Users join leagues" ON public.usuarios_ligas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = usuario_id);

-- Perfil automático ao criar conta (nome a partir do e-mail)
CREATE OR REPLACE FUNCTION public.handle_new_user_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis_usuario (usuario_id, nome_exibicao)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(split_part(NEW.email, '@', 1), ''),
      'Treinador'
    )
  )
  ON CONFLICT (usuario_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_perfil ON auth.users;
CREATE TRIGGER on_auth_user_created_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_perfil();

-- Leaderboard com nome do time e perfil
CREATE OR REPLACE FUNCTION public.leaderboard_liga(p_liga_id UUID)
RETURNS TABLE (
  posicao         INT,
  usuario_id      UUID,
  nome_exibicao   TEXT,
  nome_time       TEXT,
  pontos          NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY ul.pontos_acumulados DESC)::INT AS posicao,
    ul.usuario_id,
    COALESCE(p.nome_exibicao, 'Treinador') AS nome_exibicao,
    COALESCE(t.nome_time, 'Meu Time') AS nome_time,
    ul.pontos_acumulados AS pontos
  FROM public.usuarios_ligas ul
  LEFT JOIN public.perfis_usuario p ON p.usuario_id = ul.usuario_id
  LEFT JOIN public.times_usuarios t ON t.usuario_id = ul.usuario_id
  WHERE ul.liga_id = p_liga_id
    AND EXISTS (
      SELECT 1 FROM public.usuarios_ligas mem
      WHERE mem.liga_id = p_liga_id AND mem.usuario_id = auth.uid()
    )
  ORDER BY ul.pontos_acumulados DESC;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_liga(UUID) TO authenticated;
