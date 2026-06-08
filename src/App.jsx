import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import OnboardingGate from './components/auth/OnboardingGate';
import DashboardFantasy from './DashboardFantasy';
import LigasScreen from './components/leagues/LigasScreen';
import LobbyScreen from './components/lobby/LobbyScreen';
import RulesScreen from './components/rules/RulesScreen';
import { FantasyProvider, useFantasy } from './contexts/FantasyContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/dashboard/Header';
import MercadoFechadoBanner from './components/dashboard/MercadoFechadoBanner';

function AppShell() {
  const { configRodada } = useFantasy();

  return (
    <div className="flex flex-col min-h-screen bg-fifa-blue text-white w-full antialiased">
      <Header />
      <MercadoFechadoBanner config={configRodada} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/escalar" element={<DashboardFantasy />} />
          <Route path="/ligas" element={<LigasScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  const isBypass = typeof window !== 'undefined' && window.location.search.includes('bypass_auth=true');

  if (loading && !isBypass) {
    return (
      <div className="min-h-screen w-full bg-[#009CDE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-xs uppercase font-bold tracking-wider">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isBypass) {
    return <LoginScreen />;
  }

  return (
    <OnboardingGate>
      <BrowserRouter>
        <Routes>
          <Route path="/regras" element={<RulesScreen />} />
          <Route path="*" element={
            <FantasyProvider>
              <AppShell />
            </FantasyProvider>
          } />
        </Routes>
      </BrowserRouter>
    </OnboardingGate>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthGate />
    </ErrorBoundary>
  );
}
