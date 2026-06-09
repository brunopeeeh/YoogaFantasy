import { useMemo, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import Pitch from './components/pitch/Pitch';
import FormacaoSelector from './components/pitch/FormacaoSelector';
import BancoReservas from './components/pitch/BancoReservas';
import MercadoDrawer from './components/dashboard/MercadoDrawer';
import PlayerDetailsModal from './components/player/PlayerDetailsModal';

import DashboardErrorBoundary from './components/dashboard/DashboardErrorBoundary';
import MercadoErrorBoundary from './components/dashboard/MercadoErrorBoundary';

import { useDragDropElenco } from './hooks/useDragDropElenco';
import { useFantasy } from './contexts/FantasyContext';
import { SIGLA_POR_POSICAO } from './lib/posicoes';
import { extrairTitulares, extrairReservas } from './lib/diffElenco';

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
      <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
          <p className="text-xs uppercase font-bold tracking-wider">Carregando seu time...</p>
        </div>
      </div>
    );
  }

  if (timeError) {
    return (
      <div className="min-h-screen w-full bg-fifa-blue flex items-center justify-center p-6">
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
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
    >
      <div className="flex-1 overflow-y-auto w-full">


        {mensagensValidacao.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 pt-2">
            <p className="text-[11px] text-amber-200 bg-amber-950/40 border border-amber-700/40 rounded-lg px-3 py-2">
              {mensagensValidacao[0]}
            </p>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 pt-3">
          <FormacaoSelector
            formacaoAtiva={formacaoDraft}
            onTrocar={handleTrocarFormacao}
            desabilitado={false}
          />
        </div>

        <div className="max-w-[1600px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col md:flex-row lg:flex-row gap-4 lg:gap-6 lg:items-start lg:justify-center">
          <DashboardErrorBoundary onReset={refetch}>
            <div className={`flex-1 w-full bg-fifa-navy-900/40 rounded-xl overflow-y-auto overflow-x-hidden relative transition-all duration-300 shadow-glass border border-white/5 lg:max-h-[900px] ${mercadoAberto ? 'lg:flex-none lg:w-[55%]' : ''}`}>
              <div className="py-6 flex flex-col items-center gap-6 px-4">
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
                />
                <BancoReservas
                  reservas={reservas}
                  onSlotClick={handleAbrirMercadoReserva}
                  onRemoverJogador={handleRemoverReserva}
                  onDetalhes={setDetalheJogador}
                />
              </div>
            </div>
          </DashboardErrorBoundary>

          <MercadoErrorBoundary>
            <MercadoDrawer
              aberto={mercadoAberto}
              onFechar={handleFecharMercado}
              elenco={elencoDraft}
              slotSelecionado={slotSelecionado}
              onContratar={handleContratarJogador}
              mercado={mercado}
              onDetalhes={setDetalheJogador}
            />
          </MercadoErrorBoundary>
        </div>
      </div>

      <PlayerDetailsModal
        jogador={detalheJogador}
        isOpen={!!detalheJogador}
        onClose={() => setDetalheJogador(null)}
      />

      <DragOverlay>
        {activeDrag ? (
          <div className="opacity-90 scale-105 pointer-events-none">
            <div className="bg-fifa-navy-800 border-2 border-fifa-gold rounded-xl p-3 shadow-glow flex items-center gap-2 max-w-[300px]">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <div className="text-xs font-black text-white">Arrastando...</div>
                <div className="text-[10px] text-white/50">Solte em um slot compatível</div>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
