-- Corrige recursão infinita na RLS de usuarios_ligas
-- A subquery na policy disparava a mesma policy recursivamente
-- Solução: SECURITY DEFINER function que ignora RLS

CREATE OR REPLACE FUNCTION public.is_league_member(p_liga_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios_ligas
    WHERE liga_id = p_liga_id AND usuario_id = p_user_id
  );
$$;

DROP POLICY IF EXISTS "Members read league standings" ON public.usuarios_ligas;
CREATE POLICY "Members read league standings" ON public.usuarios_ligas
  FOR SELECT TO authenticated USING (
    public.is_league_member(liga_id, auth.uid())
  );
