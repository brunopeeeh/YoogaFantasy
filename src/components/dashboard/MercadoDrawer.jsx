// Painel lateral (drawer) de contratação de jogadores.
// Em desktop: sticky à direita. Em mobile: bottom sheet com snap.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronLeft, ChevronRight, Info, Loader2, Trash2 } from 'lucide-react';
import CardJogador from '../CardJogador';
import PlayerCardSkeleton from '../mercado/PlayerCardSkeleton';
import EmptyState from '../ui/EmptyState';
import { SIGLA_LABEL } from '../../lib/posicoes';
import { useMediaQuery, bp } from '../../hooks/useMediaQuery';
import { slideInRight, slideInUp, fadeIn } from '../../design/animations';
import { listSelecoes } from '../../services/selecoesService';
import { useJogosCopa } from '../../hooks/useJogosCopa';

export default function MercadoDrawer({
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
            ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-glass-xl border-t max-h-[85vh]'
            : 'w-full rounded-xl border lg:h-[80vh] lg:max-h-[900px]'
        }`}
      >
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
      )}

      {/* Cabeçalho */}
      <div className="relative flex items-center justify-center mb-3 px-5 pt-4">
        <h3 className="text-base font-black text-gray-100 uppercase tracking-widest text-center">
          Procurar atletas
        </h3>
        <button
          onClick={onFechar}
          className="absolute right-5 top-4 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-5 space-y-3">
        {/* Caixa de Filtros */}
        <div className="grid grid-cols-3 gap-2">
          {/* Select de Seleção (Time) */}
          <div className="relative">
            <select
              value={mercado.selecaoSelecionada}
              onChange={(e) => mercado.setSelecaoSelecionada(e.target.value)}
              className="w-full bg-[#18202b] border border-white/10 text-white text-xs font-bold rounded-lg p-2 outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="" className="bg-[#18202b] text-white">Time</option>
              {listaSelecoes.map(sel => (
                <option key={sel.id} value={sel.id} className="bg-[#18202b] text-white">{sel.nome}</option>
              ))}
            </select>
          </div>

          {/* Select de Preço */}
          <div className="relative">
            <select
              value={mercado.ordemPreco}
              onChange={(e) => mercado.setOrdemPreco(e.target.value)}
              className="w-full bg-[#18202b] border border-white/10 text-white text-xs font-bold rounded-lg p-2 outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="DESC" className="bg-[#18202b] text-white">Preço</option>
              <option value="ASC" className="bg-[#18202b] text-white">Preço (Menor)</option>
            </select>
          </div>

          {/* Select de Posição */}
          <div className="relative">
            <select
              value={mercado.posicaoFiltro}
              onChange={(e) => mercado.setPosicaoFiltro(e.target.value)}
              className="w-full bg-[#18202b] border border-white/10 text-white text-xs font-bold rounded-lg p-2 outline-none cursor-pointer hover:border-white/20 transition-all appearance-none pr-6 text-center"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '10px',
              }}
            >
              <option value="" className="bg-[#18202b] text-white">Posição</option>
              <option value="G" className="bg-[#18202b] text-white">Goleiro (GOL)</option>
              <option value="D" className="bg-[#18202b] text-white">Defensor (DEF)</option>
              <option value="M" className="bg-[#18202b] text-white">Meio-Campista (MEI)</option>
              <option value="F" className="bg-[#18202b] text-white">Atacante (ATA)</option>
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
              className="w-full bg-[#18202b] border border-white/10 text-gray-200 text-xs rounded-lg p-2 pl-9 outline-none focus:border-fifa-blue transition-colors font-medium"
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
            className="p-2 bg-[#18202b] border border-white/10 hover:border-red-500/50 hover:bg-red-950/20 text-white/60 hover:text-red-400 rounded-lg transition-all flex items-center justify-center flex-shrink-0"
            title="Limpar todos os filtros"
            aria-label="Limpar todos os filtros"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Cabeçalho da Tabela (Métricas) */}
        <div className="flex justify-between items-center text-[9px] text-white/45 font-black uppercase py-2 px-3 tracking-wider border-b border-white/10 font-heading">
          <div className="flex-1 text-left pl-1">Atleta</div>
          <div className="flex items-center gap-2 sm:gap-4 text-center flex-shrink-0">
            <div className="hidden sm:block w-10">Forma</div>
            <div className="w-16 text-fifa-blue flex flex-col items-center justify-center relative font-black select-none">
              <span>Preço</span>
              <span className="text-[7px] leading-none mt-0.5 text-fifa-blue">▼</span>
            </div>
            <div className="w-8">Pts</div>
            <div className="hidden sm:block w-8">P/R</div>
            <div className="hidden sm:block w-12">Sel%</div>
            <div className="hidden sm:block w-20 text-right pr-2">Fdr</div>
          </div>
        </div>
      </div>

      {/* Lista de Cards */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-3 space-y-2">
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
            className="px-3 py-2.5 bg-fifa-navy-800 hover:bg-fifa-navy-700 text-xs font-bold text-white/70 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-fifa-navy-800 transition-all flex items-center gap-1"
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
            className="px-3 py-2.5 bg-fifa-navy-800 hover:bg-fifa-navy-700 text-xs font-bold text-white/70 rounded-lg border border-white/10 disabled:opacity-30 disabled:hover:bg-fifa-navy-800 transition-all flex items-center gap-1"
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
      {(aberto || !isMobile) && (
        <motion.div
          key="mercado"
          initial={isMobile ? "hidden" : false}
          animate="visible"
          exit={isMobile ? "hidden" : "visible"}
          variants={isMobile ? slideInUp : slideInRight}
          className={isMobile ? '' : 'w-full lg:flex-[4.5] min-w-0 flex-shrink-0 h-full'}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
