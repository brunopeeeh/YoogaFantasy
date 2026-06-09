// O campo de futebol em si — gramado, linhas, áreas, círculo central.
// Renderiza fundo verde realista com gradiente, listras alternadas e marcações FIFA-style.

import React from 'react';

export default function PitchField({ children, formacao }) {
  return (
    <div
      className="relative w-full rounded-glass overflow-hidden pitch-inset shadow-glass-lg flex flex-col min-h-[380px] sm:min-h-[620px] md:min-h-[700px] lg:min-h-[760px]"
      style={{
        background: 'linear-gradient(180deg, #3d9b4a 0%, #2d7a3a 35%, #1f5c2a 100%)',
      }}
    >
      {/* Listras de corte do gramado — alternância de tons sutis */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 60px, rgba(0,0,0,0.04) 60px, rgba(0,0,0,0.04) 120px)',
        }}
      />

      {/* Textura de grama (noise sutil) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 1%), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.05) 0%, transparent 1%)',
          backgroundSize: '8px 8px, 12px 12px',
        }}
      />

      {/* Linha central horizontal */}
      <div className="absolute top-1/2 left-[3%] right-[3%] h-px bg-pitch-line pointer-events-none" />

      {/* Círculo central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-pitch-line pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pitch-line pointer-events-none" />

      {/* Área do goleiro (topo) — pequena área + grande área */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[420px] h-[95px] border-x border-b border-pitch-line pointer-events-none rounded-b-glass" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] max-w-[200px] h-[35px] border-x border-b border-pitch-line pointer-events-none" />

      {/* Área do goleiro (base) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] max-w-[420px] h-[95px] border-x border-t border-pitch-line pointer-events-none rounded-t-glass" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[28%] max-w-[200px] h-[35px] border-x border-t border-pitch-line pointer-events-none" />

      {/* Cantos — pequenas curvaturas */}
      <svg className="absolute top-0 left-0 w-8 h-8 pointer-events-none" viewBox="0 0 32 32">
        <path d="M 0,8 Q 0,0 8,0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>
      <svg className="absolute top-0 right-0 w-8 h-8 pointer-events-none" viewBox="0 0 32 32">
        <path d="M 32,8 Q 32,0 24,0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none" viewBox="0 0 32 32">
        <path d="M 0,24 Q 0,32 8,32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" viewBox="0 0 32 32">
        <path d="M 32,24 Q 32,32 24,32" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      </svg>

      {/* Slots dos jogadores (filhos) */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-around py-6 sm:py-8 px-3 sm:px-4">
        {children}
      </div>
    </div>
  );
}
