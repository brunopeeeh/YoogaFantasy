import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Crown, X, Plus as PlusIcon, AlertTriangle } from 'lucide-react';
import { popIn } from '../../design/animations';

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
  size = 'md', // 'sm' | 'md' | 'lg'
  dragHandleProps = null,
  compact = false,
}) {
  const fotoSrc = jogador?.foto || 'https://api.sofascore.app/static/images/default-avatar.png';
  const photoSize = size === 'sm' ? 40 : size === 'lg' ? 64 : 56;
  const isInjured = jogador?.status && jogador?.status.toLowerCase() !== 'disponivel';
  // Cores: Vermelho para lesionados/dúvida, Roxo/Azul para normais
  const nameBgColor = isInjured ? 'bg-red-500' : 'bg-gradient-to-r from-fifa-blue to-fifa-blue/70';

  return (
    <motion.div
      variants={popIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative flex flex-col items-center select-none ${dragHandleProps ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} group`}
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
          className="absolute -top-2 -right-3 z-30 w-11 h-11 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
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
          className={`absolute -top-2 -left-3 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isCaptain
              ? 'bg-fifa-gold text-black scale-110 opacity-100'
              : 'bg-fifa-navy-900/80 text-white/70 hover:text-fifa-gold border border-white/20 opacity-0 group-hover:opacity-100'
          }`}
          title={isCaptain ? 'Capitão' : 'Definir como capitão'}
          aria-label="Definir capitão"
        >
          <Crown size={12} strokeWidth={3} fill={isCaptain ? 'currentColor' : 'none'} />
        </button>
      )}

      {isOver && (
        <div
          className={`absolute inset-0 -m-2 rounded-full pointer-events-none transition-all ${
            isInvalidDrop ? 'bg-stat-injured/30 ring-4 ring-stat-injured' : 'bg-stat-fit/30 ring-4 ring-stat-fit animate-pulse'
          }`}
        />
      )}

      <div
        className={`relative transition-all duration-200 flex flex-col items-center p-1 rounded-lg ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${isActive ? 'scale-105' : ''} ${
          isSelected ? 'border-2 border-fifa-gold bg-fifa-gold/10' : 'border-2 border-transparent'
        }`}
      >
        {/* Foto Redonda do Jogador */}
        <div
          className="relative z-10 rounded-full border-2 border-white/20 bg-fifa-navy-900 shadow-md"
          style={{ width: photoSize, height: photoSize }}
        >
          <img
            src={fotoSrc}
            alt={jogador?.nome || 'Jogador'}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.src = 'https://api.sofascore.app/static/images/default-avatar.png';
            }}
            draggable={false}
          />

          {/* Bandeira - Bottom Left Circular */}
          {jogador?.bandeira && !compact && (
            <div className="absolute -bottom-1.5 -left-2 w-[22px] h-[22px] rounded-full border-2 border-white shadow-sm overflow-hidden bg-fifa-navy-900 flex items-center justify-center">
              <img
                src={jogador.bandeira}
                alt={jogador.selecao || ''}
                className="w-full h-full object-cover scale-[1.2]"
                draggable={false}
              />
            </div>
          )}

          {/* Triângulo de Lesão - Bottom Right */}
          {isInjured && !compact && (
            <div className="absolute -bottom-1.5 -right-2 w-5 h-5 flex items-center justify-center text-[#EF4444] bg-[#262626] rounded-full shadow-sm drop-shadow-md border-[1.5px] border-white">
              <AlertTriangle size={12} fill="currentColor" stroke="white" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Placas de Nome e Preço (Sofascore Style) */}
        {!compact && (
          <div className="relative z-0 mt-[-4px] flex flex-col items-center w-[48px] sm:w-[78px] shadow-md overflow-hidden rounded-sm">
            {/* Bloco de Nome (Roxo/Azul ou Vermelho) */}
            <div className={`w-full pt-[5px] pb-[1px] px-0.5 sm:px-1 ${nameBgColor} flex justify-center`}>
              <span className="text-[9px] sm:text-[11px] font-bold text-white truncate text-center leading-tight">
                {jogador?.nome || '—'}
              </span>
            </div>
            {/* Bloco de Preço (só desktop) */}
            <div className="w-full py-[1.5px] px-0.5 sm:px-1 bg-fifa-navy-800 hidden sm:flex justify-center">
              <span className="text-[9px] sm:text-[10px] font-black text-white/90 leading-none">
                €{Number(jogador?.preco || 0).toFixed(1)}M
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export function EmptySlot({ posLabel = 'GOL', onClick, isActive = false, isSelected = false, isOver = false, isInvalidDrop = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Slot vazio ${posLabel}`}
      className={`relative flex flex-col items-center cursor-pointer group transition-all duration-200 p-1 rounded-lg ${
        (isActive || isSelected) ? 'scale-110' : 'hover:scale-105'
      } ${isSelected ? 'border-2 border-fifa-gold bg-fifa-gold/10' : 'border-2 border-transparent'}`}
    >
      {isOver && (
        <div
          className={`absolute inset-0 -m-3 rounded-full pointer-events-none ${
            isInvalidDrop ? 'bg-stat-injured/20 ring-2 ring-stat-injured' : 'bg-fifa-gold/20 ring-2 ring-fifa-gold animate-pulse'
          }`}
        />
      )}
      
      {/* Círculo Vazio Minimalista */}
      <div
        className={`relative z-10 w-10 h-10 sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center transition-all bg-white/10 backdrop-blur-sm border-[3px] border-white/20 ${
          isActive ? 'border-fifa-gold bg-fifa-gold/20' : 'group-hover:border-white/40 group-hover:bg-white/15'
        }`}
      >
        <PlusIcon
          size={20}
          className="absolute text-white/50 group-hover:text-white transition-colors"
          strokeWidth={2.5}
        />
      </div>

      {/* Placa Vazia Abaixo */}
      <div className="relative z-0 mt-[-4px] flex flex-col items-center w-[48px] sm:w-[78px] shadow-sm overflow-hidden rounded-sm">
        <div className={`w-full pt-[5px] pb-[2px] px-0.5 sm:px-1 flex justify-center border border-white/5 bg-fifa-navy-800`}>
          <span className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-wider leading-none text-white/70`}>
            {posLabel}
          </span>
        </div>
      </div>
    </button>
  );
}
