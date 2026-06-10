// Painel lateral (drawer) de contratação de jogadores.
// Em desktop: sticky à direita. Em mobile: bottom sheet com snap.

import { useEffect, useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import CardJogador from '../CardJogador';
import PlayerCardSkeleton from '../mercado/PlayerCardSkeleton';
import EmptyState from '../ui/EmptyState';

import { useMediaQuery, bp } from '../../hooks/useMediaQuery';

import { listSelecoes } from '../../services/selecoesService';
import { useJogosCopa } from '../../hooks/useJogosCopa';

export default memo(function MercadoDrawer({
  aberto,
  onFechar,
  slotSelecionado,
  elenco,
  onContratar,
  mercado,
  onDetalhes
}) {
  const [listaSelecoes, setListaSelecoes] = useState([]);
  const isMobile = useMediaQuery(bp.mobile);
  const { jogosPorSelecao } = useJogosCopa();
  const panelRef = useRef(null);



  useEffect(() => {
    if (!aberto) return;
    listSelecoes()
      .then(setListaSelecoes)
      .catch(err => console.error('❌ Erro ao buscar seleções:', err.message));
  }, [aberto]);

  if (!aberto) return null;

  const content = (
      <div
        className={`bg-fifa-navy-900/95 backdrop-blur-glass border-white/10 shadow-glass-lg flex flex-col text-gray-200 overflow-hidden h-full ${
          isMobile
            ? 'rounded-t-glass-xl border-t max-h-[85vh] pb-[env(safe-area-inset-bottom,8px)]'
            : 'rounded-l-xl border-l border-y'
        }`}
      >
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
      )}

      {/* Cabeçalho */}
      <div className="relative flex items-center justify-center mb-1 px-5 pt-2">
        <h3 className="text-sm font-black text-gray-100 uppercase tracking-widest text-center">
          Procurar atletas
        </h3>
        {isMobile && (
          <button
            onClick={onFechar}
            className="absolute right-5 top-4 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="px-5 space-y-1.5">
        {/* Caixa de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Select de Seleção (Time) */}
          <div className="relative">
            <select
              value={mercado.selecaoSelecionada}
              onChange={(e) => mercado.setSelecaoSelecionada(e.target.value)}
              className="w-full bg-fifa-navy-800 border border-white/10 text-white text-xs font-bold rounded-lg p-1.5 sm:min-h-[36px] outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="" className="bg-fifa-navy-800 text-white">Time</option>
              {listaSelecoes.map(sel => (
                <option key={sel.id} value={sel.id} className="bg-fifa-navy-800 text-white">{sel.nome}</option>
              ))}
            </select>
          </div>

          {/* Select de Preço */}
          <div className="relative">
            <select
              value={mercado.ordemPreco}
              onChange={(e) => mercado.setOrdemPreco(e.target.value)}
              className="w-full bg-fifa-navy-800 border border-white/10 text-white text-xs font-bold rounded-lg p-1.5 sm:min-h-[36px] outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="DESC" className="bg-fifa-navy-800 text-white">Preço</option>
              <option value="ASC" className="bg-fifa-navy-800 text-white">Preço (Menor)</option>
            </select>
          </div>

          {/* Select de Posição */}
          <div className="relative">
            <select
              value={mercado.posicaoFiltro}
              onChange={(e) => mercado.setPosicaoFiltro(e.target.value)}
              className="w-full bg-fifa-navy-800 border border-white/10 text-white text-xs font-bold rounded-lg p-1.5 sm:min-h-[36px] outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="" className="bg-fifa-navy-800 text-white">Posição</option>
              <option value="G" className="bg-fifa-navy-800 text-white">Goleiro (GOL)</option>
              <option value="D" className="bg-fifa-navy-800 text-white">Defensor (DEF)</option>
              <option value="M" className="bg-fifa-navy-800 text-white">Meio-Campista (MEI)</option>
              <option value="F" className="bg-fifa-navy-800 text-white">Atacante (ATA)</option>
            </select>
          </div>
        </div>

        {/* Barra de Pesquisa e Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Pesquisa"
              value={mercado.pesquisa}
              onChange={(e) => mercado.setPesquisa(e.target.value)}
              className="w-full bg-fifa-navy-800 border border-white/10 text-gray-200 text-xs rounded-lg p-1.5 pl-9 outline-none focus:border-fifa-blue transition-colors font-medium"
            />
            {mercado.pesquisa && (
              <button
                onClick={() => mercado.setPesquisa('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                aria-label="Limpar busca"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              mercado.setPesquisa('');
              mercado.setSelecaoSelecionada('');
              mercado.setPosicaoFiltro('');
              mercado.setOrdemPreco('DESC');
            }}
            className="p-2 bg-fifa-navy-800 border border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-white/60 hover:text-red-400 rounded-lg transition-all flex items-center justify-center flex-shrink-0"
            title="Limpar todos os filtros"
            aria-label="Limpar todos os filtros"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Cabeçalho da Tabela */}
        <div className="flex justify-between items-center text-[9px] text-white/45 font-black uppercase py-1.5 px-3 tracking-wider border-b border-white/10">
          <div className="flex-1 text-left">Atleta</div>
          <div className="flex items-center gap-2 sm:gap-4 text-center flex-shrink-0">
            <div className="min-w-[36px] sm:min-w-[72px] text-center">Próx</div>
            <div className="min-w-[64px] sm:min-w-[84px] text-fifa-blue text-center">Preço</div>
            <div className="w-8 text-center">Pts</div>
          </div>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-3 space-y-2">
        {mercado.carregando ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        ) : mercado.listaMercado.length > 0 ? (
          mercado.listaMercado.map(jogador => (
            <CardJogador
              key={jogador.id}
              draggable={false}
              jogador={jogador}
              onContratar={onContratar}
              onDetalhes={onDetalhes}
              elenco={elenco}
              slotSelecionado={slotSelecionado}
              agendaBase={jogosPorSelecao[jogador.selecaoId]}
            />
          ))
        ) : (
          <EmptyState
            title="Nenhum atleta encontrado"
            description="Tente ajustar os filtros ou a busca para ver mais resultados."
          />
        )}
      </div>

      {/* Rodapé com Paginação */}
      {mercado.totalPaginas > 1 && (
        <div className="flex justify-between items-center py-3 px-5 border-t border-white/5 bg-fifa-navy-900/80">
          <button
            disabled={mercado.pagina === 0 || mercado.carregando}
            onClick={() => mercado.setPagina(p => Math.max(0, p - 1))}
            className="px-3 py-3 min-h-[44px] bg-fifa-navy-800 hover:bg-fifa-navy-700 text-xs font-bold text-white/70 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-fifa-navy-800 transition-all flex items-center gap-1"
          >
            <ChevronLeft size={12} /> Anterior
          </button>
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            Pág. {mercado.pagina + 1} de {mercado.totalPaginas}{' '}
            <span className="text-white/40">({mercado.totalRegistros})</span>
          </span>
          <button
            disabled={mercado.pagina >= mercado.totalPaginas - 1 || mercado.carregando}
            onClick={() => mercado.setPagina(p => p + 1)}
            className="px-3 py-3 min-h-[44px] bg-fifa-navy-800 hover:bg-fifa-navy-700 text-xs font-bold text-white/70 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-fifa-navy-800 transition-all flex items-center gap-1"
          >
            Próximo <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );

  // Anima entrada/saída com framer-motion
  return (
    <AnimatePresence>
      {aberto && (
        <>
          {isMobile && (
              <motion.div
                key="mercado-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onFechar}
              />
            )}
          <motion.div
            key="mercado-panel"
            ref={panelRef}
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={isMobile ? 'fixed inset-x-0 bottom-0 z-50' : 'absolute right-0 top-0 h-full z-50'}
            style={!isMobile ? { width: '480px' } : undefined}
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
