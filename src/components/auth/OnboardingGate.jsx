import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMeuPerfil, perfilPrecisaOnboarding } from '../../services/perfilService';
import { getMyTime } from '../../services/timeService';
import OnboardingScreen from './OnboardingScreen';

export default function OnboardingGate({ children }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [defaults, setDefaults] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    let ativo = true;

    async function verificar() {
      try {
        const [perfil, time] = await Promise.all([
          getMeuPerfil().catch(() => null),
          getMyTime(user.id).catch(() => null),
        ]);

        if (perfilPrecisaOnboarding(perfil, time)) {
          if (ativo) {
            setDefaults({
              nome: perfil?.nome_exibicao || user.email?.split('@')[0] || '',
              nickname: time?.nome_time === 'Meu Time' ? '' : (time?.nome_time || ''),
            });
            setStatus('onboarding');
          }
          return;
        }

        if (ativo) setStatus('ready');
      } catch {
        if (ativo) setStatus('onboarding');
      }
    }

    verificar();
    return () => { ativo = false; };
  }, [user?.id, user?.email]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen w-full bg-[#009CDE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-xs uppercase font-bold tracking-wider">Preparando sua conta...</p>
        </div>
      </div>
    );
  }

  if (status === 'onboarding') {
    return (
      <OnboardingScreen
        defaults={defaults}
        onComplete={() => setStatus('ready')}
      />
    );
  }

  return children;
}
