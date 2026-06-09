import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Crown, X, Plus as PlusIcon, AlertTriangle } from 'lucide-react';
import { popIn } from '../../design/animations';
import { AVATAR_FALLBACK } from '../../design/tokens';

export default memo(function PlayerChip({
  jogador,
  isCaptain = false,
  isActive = false,
  isDragging = false,
  isOver = false,
  isInvalidDrop = false,
  isSelected = false,
  onClick,
  onRemove,
  onCaptain,
  onHover,
  onLeave,
  size = 'md', // Not heavily used now, replaced by responsive classes
  dragHandleProps = null,
  compact = false,
}) {
  const fotoSrc = jogador?.foto || AVATAR_FALLBACK;
  const isInjured = jogador?.status && jogador?.status.toLowerCase() !== 'disponivel';
  // Cores: Vermelho para lesionados/dúvida, Roxo/Azul para normais
  const nameBgColor = isInjured ? 'bg-red-500' : 'bg-fifa-navy-800';

  return (
    <motion.div
      variants={popIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative flex flex-col items-center select-none ${dragHandleProps ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group transition-transform duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isActive || isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      {...dragHandleProps}
    >
      {/* Botão Remover (Aparece no Hover) */}
      {onRemove && !compact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 z-30 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
          title="Remover jogador"
          aria-label="Remover jogador"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}

      {/* Botão Capitão (Top-Left) */}
      {onCaptain && !compact && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCaptain();
          }}
          className={`absolute -top-2 -left-2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isCaptain
              ? 'bg-fifa-gold text-black scale-110 opacity-100'
              : 'bg-[#1a1a1a]/90 text-white/70 hover:text-fifa-gold border border-white/20 opacity-0 group-hover:opacity-100'
          }`}
          title={isCaptain ? 'Capitão' : 'Definir como capitão'}
          aria-label="Definir capitão"
        >
          <Crown size={14} strokeWidth={3} fill={isCaptain ? 'currentColor' : 'none'} />
        </button>
      )}

      {isOver && (
        <div
          className={`absolute inset-0 -m-1.5 rounded-lg pointer-events-none transition-all ${
            isInvalidDrop ? 'bg-stat-injured/30 ring-2 ring-stat-injured' : 'bg-stat-fit/30 ring-2 ring-stat-fit animate-pulse'
          }`}
        />
      )}

      {/* Card Body - Retangular FUT Style */}
      <div
        className={`relative flex flex-col rounded-t-xl rounded-b-md shadow-[0_8px_16px_rgba(0,0,0,0.5)] overflow-hidden bg-gradient-to-b from-[#2a2a2a] to-[#111111] ${
          isSelected ? 'ring-2 ring-fifa-gold' : 'border border-white/10'
        } ${
          compact ? 'w-[45px] h-[65px] sm:w-[50px] sm:h-[70px]' : 'w-[55px] h-[80px] sm:w-[64px] sm:h-[90px]'
        }`}
      >
        {/* Top Header do Card (Bandeira, etc) */}
        <div className="absolute top-1 left-1 flex flex-col items-center z-20">
          {jogador?.bandeira && !compact && (
            <div className="w-[14px] h-[10px] sm:w-[16px] sm:h-[11px] shadow-sm overflow-hidden flex items-center justify-center mb-0.5">
              <img
                src={jogador.bandeira}
                alt={jogador.selecao || ''}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                draggable={false}
              />
            </div>
          )}
          {isInjured && !compact && (
            <div className="text-[#EF4444] drop-shadow-md">
              <AlertTriangle size={10} fill="currentColor" stroke="white" strokeWidth={1} className="sm:w-3 sm:h-3" />
            </div>
          )}
        </div>

        {/* Foto do Jogador */}
        <div className="relative flex-1 w-full flex items-end justify-center pt-2 px-1">
          <img
            src={fotoSrc}
            alt={jogador?.nome || 'Jogador'}
            className="w-[120%] h-auto max-h-full object-contain object-bottom drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]"
            onError={(e) => {
              if (e.currentTarget.src !== AVATAR_FALLBACK) e.currentTarget.src = AVATAR_FALLBACK;
            }}
            draggable={false}
          />
          {/* Sombra interna inferior para mesclar com a placa */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>

        {/* Placas de Nome e Preço */}
        {!compact && (
          <div className="relative z-20 flex flex-col w-full border-t border-white/5">
            {/* Bloco de Nome */}
            <div className={`w-full py-[3px] sm:py-[3px] px-0.5 ${nameBgColor} flex justify-center`}>
              <span className="text-[8px] sm:text-[9.5px] font-bold text-white truncate text-center leading-none tracking-tight">
                {jogador?.nome || '—'}
              </span>
            </div>
            {/* Bloco de Preço */}
            <div className="w-full py-[2px] sm:py-[2.5px] bg-black/90 flex justify-center">
              <span className="text-[8px] sm:text-[9px] font-black text-[#e8c872] leading-none">
                R${Number(jogador?.preco || 0).toFixed(1)}M
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export function EmptySlot({ posLabel = 'GOL', onClick, isActive = false, isSelected = false, isOver = false, isInvalidDrop = false, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-label="Slot vazio"
        className="w-8 h-8 rounded-full bg-black/40 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <PlusIcon size={14} className="text-white/40" strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Slot vazio ${posLabel}`}
      className={`relative flex flex-col items-center cursor-pointer group transition-all duration-200 ${
        (isActive || isSelected) ? 'scale-110 z-20' : 'hover:scale-105 z-10'
      }`}
    >
      {isOver && (
        <div
          className={`absolute inset-0 -m-1.5 rounded-lg pointer-events-none ${
            isInvalidDrop ? 'bg-stat-injured/20 ring-2 ring-stat-injured' : 'bg-fifa-gold/20 ring-2 ring-fifa-gold animate-pulse'
          }`}
        />
      )}
      
      {/* Card Body - Vazio Retangular */}
      <div
        className={`relative flex flex-col items-center justify-center w-[55px] h-[80px] sm:w-[64px] sm:h-[90px] rounded-t-xl rounded-b-md backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.3)] border-2 transition-colors ${
          isSelected 
            ? 'border-fifa-gold bg-fifa-gold/10' 
            : isActive 
              ? 'border-fifa-gold bg-fifa-gold/20' 
              : 'border-white/10 bg-[#1a1a1a]/80 group-hover:border-white/30 group-hover:bg-[#2a2a2a]/90'
        }`}
      >
        <div className="flex flex-col items-center gap-1 sm:gap-2">
          <PlusIcon
            size={20}
            className={`transition-colors ${isActive || isSelected ? 'text-fifa-gold' : 'text-white/40 group-hover:text-white/80'}`}
            strokeWidth={2.5}
          />
          <span className={`text-[10px] sm:text-[13px] font-black tracking-widest ${isActive || isSelected ? 'text-fifa-gold' : 'text-white/30 group-hover:text-white/60'}`}>
            {posLabel}
          </span>
        </div>
        
        {/* Glow inferior estilo FUT */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-md bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/30 transition-all" />
      </div>
    </button>
  );
}
