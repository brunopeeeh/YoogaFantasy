-- 002 - Habilita Row Level Security e define políticas de acesso
-- IMPORTANTE: requer que a tabela times_usuarios tenha coluna usuario_id (uuid, FK em auth.users)

ALTER TABLE times_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE elencos_usuarios ENABLE ROW LEVEL SECURITY;

-- ===== times_usuarios =====
DROP POLICY IF EXISTS "Users see own time" ON times_usuarios;
CREATE POLICY "Users see own time" ON times_usuarios
  FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users insert own time" ON times_usuarios;
CREATE POLICY "Users insert own time" ON times_usuarios
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users update own time" ON times_usuarios;
CREATE POLICY "Users update own time" ON times_usuarios
  FOR UPDATE USING (auth.uid() = usuario_id);

-- ===== elencos_usuarios =====
DROP POLICY IF EXISTS "Users see own elencos" ON elencos_usuarios;
CREATE POLICY "Users see own elencos" ON elencos_usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM times_usuarios t
      WHERE t.id = elencos_usuarios.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users manage own elencos" ON elencos_usuarios;
CREATE POLICY "Users manage own elencos" ON elencos_usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM times_usuarios t
      WHERE t.id = elencos_usuarios.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM times_usuarios t
      WHERE t.id = elencos_usuarios.time_usuario_id
        AND t.usuario_id = auth.uid()
    )
  );
