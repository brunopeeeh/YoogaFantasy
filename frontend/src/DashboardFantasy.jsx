import { useMemo, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import Pitch from './components/pitch/Pitch';
import BancoReservas from './components/pitch/BancoReservas';
import MercadoDrawer from './components/dashboard/MercadoDrawer';
import PlayerDetailsModal from './components/player/PlayerDetailsModal';

import DashboardErrorBoundary from './components/dashboard/DashboardErrorBoundary';

import { useDragDropElenco } from './hooks/useDragDropElenco';
import { useFantasy } from './contexts/FantasyContext';
import { SIGLA_POR_POSICAO } from './lib/posicoes';
import { extrairTitulares, extrairReservas } from './lib/diffElenco';
import { useMediaQuery, bp } from './hooks/useMediaQuery';

export default function DashboardFantasy() {
  const {
    timeLoading,
    timeError,
    refetch,
    mercado,
    elencoDraft,
    capitaoDraftId,
    draftInicializado,
    formacaoDraft,
    mercadoAberto,
    setMercadoAberto,
    slotSelecionado,
    setSlotSelecionado,
    posicaoFiltrada,
    setPosicaoFiltrada,
    detalheJogador,
    setDetalheJogador,
    handleContratarJogador,
    handleRemoverJogador,
    handleDefinirCapitao,
    handleTrocarFormacao,
    mensagensValidacao,
  } = useFantasy();

  const isMobile = useMediaQuery(bp.mobile);
  const titulares = useMemo(() => extrairTitulares(elencoDraft, formacaoDraft), [elencoDraft, formacaoDraft]);
  const reservas = useMemo(() => extrairReservas(elencoDraft, formacaoDraft), [elencoDraft, formacaoDraft]);

  function handleAbrirMercado(posicaoCampo, index) {
    const sigla = SIGLA_POR_POSICAO[posicaoCampo];
    setPosicaoFiltrada(sigla);
    setSlotSelecionado({ posicao: posicaoCampo, index });
    setMercadoAberto(true);
  }

  function handleFecharMercado() {
    setMercadoAberto(false);
    setSlotSelecionado(null);
  }

  function handleAbrirMercadoReserva(posicaoCampo) {
    const sigla = SIGLA_POR_POSICAO[posicaoCampo];
    setPosicaoFiltrada(sigla);
    const qtdTitular = Object.keys(titulares[posicaoCampo] || {}).length;
    const indexReserva = qtdTitular;
    setSlotSelecionado({ posicao: posicaoCampo, index: indexReserva });
    setMercadoAberto(true);
  }

  function handleRemoverReserva(posicaoCampo) {
    const qtdTitular = Object.keys(titulares[posicaoCampo] || {}).length;
    const indexReserva = qtdTitular;
    handleRemoverJogador(posicaoCampo, indexReserva);
  }

  const handleDrop = useCallback(({ jogador, slot }) => {
    handleContratarJogador(jogador, slot);
  }, [handleContratarJogador]);

  const { activeDrag, overSlot, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDragDropElenco({ onDrop: handleDrop });

  if (timeLoading && !draftInicializado) {
    return (
      <div className="min-h-screen w-full bg-[#001D35] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-xs uppercase font-bold tracking-wider">Carregando seu time...</p>
        </div>
      </div>
    );
  }

  if (timeError) {
    return (
      <div className="min-h-screen w-full bg-[#001D35] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-stat-injured/20 border border-stat-injured/40 rounded-glass p-6 text-white">
          <h2 className="text-lg font-black mb-2">Erro ao carregar seu time</h2>
          <p className="text-sm text-red-200 mb-3">{timeError.message}</p>
          <p className="text-[11px] text-red-300 mb-4">
            Verifique se as migrations SQL foram aplicadas no Supabase e se as RLS policies estão ativas.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold uppercase tracking-wider"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col w-full">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCenter}
        >
          <div className="flex-1 w-full flex flex-row overflow-hidden relative">

            {mensagensValidacao.length > 0 && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
                <p className="text-[11px] text-amber-200 bg-amber-950/40 border border-amber-700/40 rounded-lg px-3 py-2 text-center">
                  {mensagensValidacao[0]}
                </p>
              </div>
            )}

            {/* ── CAMPO — FULL WIDTH ── */}
            <div className={`flex-1 h-full w-full flex flex-col overflow-hidden p-2 transition-all duration-300 ${mercadoAberto && !isMobile ? 'mr-[480px]' : ''}`}>
              <DashboardErrorBoundary onReset={refetch}>
                <div className="flex-1 min-h-0 w-full flex flex-col rounded-xl overflow-hidden bg-fifa-navy-900/95 backdrop-blur-glass border border-white/10 shadow-glass-lg max-w-[1000px] mx-auto">
                  <Pitch
                    elenco={titulares}
                    formacao={formacaoDraft}
                    onSlotClick={handleAbrirMercado}
                    onRemoverJogador={handleRemoverJogador}
                    capitaoId={capitaoDraftId}
                    onDefinirCapitao={handleDefinirCapitao}
                    overSlot={overSlot}
                    activeJogador={activeDrag?.data?.current?.jogador}
                    slotSelecionado={slotSelecionado}
                    onFilterPosicao={(sigla) => {
                      if (posicaoFiltrada === sigla) {
                        setPosicaoFiltrada(null);
                      } else {
                        setPosicaoFiltrada(sigla);
                        setMercadoAberto(true);
                      }
                    }}
                    posicaoFiltrada={posicaoFiltrada}
                    onDetalhes={setDetalheJogador}
                    banco={
                      <BancoReservas
                        reservas={reservas}
                        onSlotClick={handleAbrirMercadoReserva}
                        onRemoverJogador={handleRemoverReserva}
                        onDetalhes={setDetalheJogador}
                      />
                    }
                  />
                </div>
              </DashboardErrorBoundary>
            </div>

            <MercadoDrawer
              aberto={mercadoAberto}
              onFechar={handleFecharMercado}
              elenco={elencoDraft}
              slotSelecionado={slotSelecionado}
              onContratar={handleContratarJogador}
              mercado={mercado}
              onDetalhes={setDetalheJogador}
            />
          </div>

          <PlayerDetailsModal
            jogador={detalheJogador}
            isOpen={!!detalheJogador}
            onClose={() => setDetalheJogador(null)}
          />

          <DragOverlay>
            {activeDrag?.jogador ? (
              <div className="opacity-90 scale-105 pointer-events-none">
                <div className="bg-fifa-navy-800 border-2 border-fifa-gold rounded-xl p-3 shadow-glow flex items-center gap-3 max-w-[280px]">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-fifa-navy-900 border-2 border-white/20 flex-shrink-0">
                    <img
                      src={activeDrag.jogador.foto || "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%231e3a5f'/%3e%3ccircle cx='50' cy='35' r='18' fill='%23fff' opacity='.25'/%3e%3cpath d='M20 75 Q50 50 80 75' fill='%23fff' opacity='.25'/%3e%3c/svg%3e"}
                      alt={activeDrag.jogador.nome}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white truncate">{activeDrag.jogador.nome}</div>
                    <div className="text-[10px] text-fifa-gold font-bold">{activeDrag.jogador.selecao}</div>
                    <div className="text-[10px] text-white/50">Arraste para um slot</div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
