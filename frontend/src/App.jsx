import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import OnboardingGate from './components/auth/OnboardingGate';
import { FantasyProvider, useFantasy } from './contexts/FantasyContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/dashboard/Header';
import MercadoFechadoBanner from './components/dashboard/MercadoFechadoBanner';

// Lazy loading screens
const LoginScreen = lazy(() => import('./components/auth/LoginScreen'));
const DashboardFantasy = lazy(() => import('./DashboardFantasy'));
const LigasScreen = lazy(() => import('./components/leagues/LigasScreen'));
const LobbyScreen = lazy(() => import('./components/lobby/LobbyScreen'));
const JogosScreen = lazy(() => import('./components/jogos/JogosScreen'));
const RulesScreen = lazy(() => import('./components/rules/RulesScreen'));
const ProfileScreen = lazy(() => import('./components/profile/ProfileScreen'));
const RankingScreen = lazy(() => import('./components/ranking/RankingScreen'));

function AppShell() {
  const { configRodada } = useFantasy();

  return (
    <div className="flex flex-col h-screen bg-[#001D35] text-white w-full antialiased overflow-hidden">
      <Header />
      <MercadoFechadoBanner config={configRodada} />
      <div className="flex-1 flex flex-col relative min-h-0 overflow-y-auto">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-[#001D35]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<LobbyScreen />} />
            <Route path="/escalar" element={<DashboardFantasy />} />
            <Route path="/ligas" element={<LigasScreen />} />
            <Route path="/jogos" element={<JogosScreen />} />
            <Route path="/perfil" element={<ProfileScreen />} />
            <Route path="/ranking" element={<RankingScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
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
    return (
      <Suspense fallback={
        <div className="min-h-screen w-full bg-[#009CDE] flex items-center justify-center" />
      }>
        <LoginScreen />
      </Suspense>
    );
  }

  return (
    <OnboardingGate>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen w-full bg-[#001D35] flex items-center justify-center" />
        }>
          <Routes>
            <Route path="/regras" element={<RulesScreen />} />
            <Route path="*" element={
              <FantasyProvider>
                <AppShell />
              </FantasyProvider>
            } />
          </Routes>
        </Suspense>
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
