-- 007 - Remove constraint de unicidade desnecessária em times_usuarios.nome_time
-- O nome do time não precisa ser globalmente único entre todos os usuários.
-- Cada usuário tem seu próprio time, a unicidade é garantida por usuario_id.

ALTER TABLE public.times_usuarios
  DROP CONSTRAINT IF EXISTS times_usuarios_nome_time_key;
