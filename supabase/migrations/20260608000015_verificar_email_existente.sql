-- 015 - RPC verificar_email_existente
-- Retorna TRUE se o e-mail já está cadastrado em auth.users.
-- Necessário SECURITY DEFINER pois auth.users não é acessível via anon key.
-- Grants EXECUTE TO public para permitir checagem antes do login/cadastro.

CREATE OR REPLACE FUNCTION public.verificar_email_existente(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = p_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_email_existente(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.verificar_email_existente(TEXT) IS
  'Verifica se um e-mail já possui cadastro em auth.users. Pode ser chamado sem autenticação.';
