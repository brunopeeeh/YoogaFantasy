-- 017 - Corrige trigger auto_confirmar_email para BEFORE INSERT
-- O trigger anterior era AFTER INSERT, o que não impedia o Supabase de tentar
-- enviar o email de confirmação (causando rate limit).
-- BEFORE INSERT garante que o usuário já seja criado com email confirmado.

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

CREATE OR REPLACE FUNCTION public.auto_confirmar_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirmar_email();

COMMENT ON FUNCTION public.auto_confirmar_email() IS
  'Auto-confirma email de novos usuários BEFORE INSERT, evitando envio de email e rate limit.';
