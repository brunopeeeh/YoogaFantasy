// Card de preview que aparece ao hover/tap em um slot do pitch.
// Mostra dados expandidos do jogador (próximo jogo, forma, etc.).
// Delay intencional de 400ms para evitar poluição visual em movimentos rápidos.

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Flag, Shield, Calendar, Activity } from 'lucide-react';
import { getKit } from '../../lib/kits';
import { fadeInUp } from '../../design/animations';
import { AVATAR_FALLBACK } from '../../design/tokens';

const HOVER_DELAY = 400;

export default function PlayerHoverCard({ jogador, anchorRect, isCaptain = false }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!jogador) {
      setVisible(false);
      return;
    }
    timeoutRef.current = setTimeout(() => setVisible(true), HOVER_DELAY);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(false);
    };
  }, [jogador?.id]);

  if (!jogador) return null;

  const kit = getKit(jogador.selecaoId, jogador.selecao);
  const fotoSrc = jogador.foto || AVATAR_FALLBACK;

  const forma = jogador.forma ?? '—';
  const trend = typeof forma === 'number' ? (forma > 6 ? 'up' : forma < 5 ? 'down' : 'flat') : 'flat';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute z-50 pointer-events-none"
          style={{
            left: anchorRect ? anchorRect.left + anchorRect.width / 2 : '50%',
            top: anchorRect ? anchorRect.top - 12 : 0,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-fifa-navy-900/95 backdrop-blur-glass border border-white/10 rounded-glass shadow-glass-lg overflow-hidden w-[280px]">
            {/* Header com kit + foto */}
            <div
              className="relative h-16 flex items-end justify-center pb-1"
              style={{
                background: `linear-gradient(135deg, ${kit.primary} 0%, ${kit.secondary} 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-fifa-navy-900">
                <img src={fotoSrc} alt={jogador.nome} className="w-full h-full object-cover" />
              </div>
              {isCaptain && (
                <div className="absolute top-2 right-2 bg-fifa-gold text-fifa-navy-900 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={10} fill="currentColor" /> Capitão
                </div>
              )}
            </div>

            <div className="p-3 space-y-2.5">
              <div className="text-center">
                <h4 className="text-sm font-black text-white truncate">{jogador.nome}</h4>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                  {jogador.selecao || '—'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-md py-1.5">
                  <div className="text-[9px] text-white/50 uppercase">Forma</div>
                  <div className="text-sm font-black text-white flex items-center justify-center gap-0.5">
                    {forma}
                    {trend === 'up' && <TrendingUp size={10} className="text-stat-fit" />}
                    {trend === 'down' && <TrendingDown size={10} className="text-stat-injured" />}
                  </div>
                </div>
                <div className="bg-white/5 rounded-md py-1.5">
                  <div className="text-[9px] text-white/50 uppercase">Preço</div>
                  <div className="text-sm font-black text-fifa-gold">€{Number(jogador.preco || 0).toFixed(1)}M</div>
                </div>
                <div className="bg-white/5 rounded-md py-1.5">
                  <div className="text-[9px] text-white/50 uppercase">Pos</div>
                  <div className="text-sm font-black text-white">{jogador.posicao || '—'}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-white/70 bg-white/5 rounded-md p-2">
                <Calendar size={11} className="text-fifa-blue" />
                <span className="font-bold">Próximo jogo:</span>
                <span className="ml-auto text-white">vs adversário</span>
              </div>
            </div>

            {/* Seta apontando para baixo */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-fifa-navy-900/95 border-r border-b border-white/10"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
