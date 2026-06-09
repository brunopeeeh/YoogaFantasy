import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSession, onAuthStateChange, signOut as svcSignOut, cadastrarComEmailSenha, entrarComEmailSenha, resetarSenha as svcResetarSenha } from '../services/authService';
import { ensureMeuPerfil } from '../services/perfilService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getSession()
      .then(s => {
        if (mounted) setSession(s);
        if (s?.user?.email) {
          ensureMeuPerfil(s.user.email).catch(() => {});
        }
      })
      .catch(e => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    const off = onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_OUT') setSession(null);
      if (s?.user?.email) {
        ensureMeuPerfil(s.user.email).catch(() => {});
      }
    });
    return () => { mounted = false; off(); };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      await entrarComEmailSenha(email, password);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e };
    }
  }, []);

  const cadastrar = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await cadastrarComEmailSenha(email, password);
      return { ok: true, precisaConfirmar: !data.session };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e };
    }
  }, []);

  const resetarSenha = useCallback(async (email) => {
    setError(null);
    try {
      await svcResetarSenha(email);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e };
    }
  }, []);

  const signOut = useCallback(async () => {
    await svcSignOut();
    setSession(null);
  }, []);

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    error,
    login,
    cadastrar,
    resetarSenha,
    signOut,
    isAuthenticated: !!session?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
