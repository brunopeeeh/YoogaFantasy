-- Permite que o criador edite/exclua a liga

DROP POLICY IF EXISTS "Creator update ligas" ON public.ligas;
CREATE POLICY "Creator update ligas" ON public.ligas
  FOR UPDATE TO authenticated USING (auth.uid() = criado_por)
  WITH CHECK (auth.uid() = criado_por);

DROP POLICY IF EXISTS "Creator delete ligas" ON public.ligas;
CREATE POLICY "Creator delete ligas" ON public.ligas
  FOR DELETE TO authenticated USING (auth.uid() = criado_por);
