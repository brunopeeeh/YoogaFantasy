// Empty state ilustrado para listas vazias (mercado, busca, etc).

import React from 'react';
import { Search } from 'lucide-react';

export default function EmptyState({ title = 'Nada encontrado', description = 'Tente ajustar os filtros ou a busca.', icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-20 h-20 mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 4" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="50" cy="50" r="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          {/* Pentágonos sutis dentro do círculo central */}
          <polygon points="50,42 56,48 53,56 47,56 44,48" fill="rgba(255,215,0,0.2)" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon || <Search size={20} className="text-white/40" />}
        </div>
      </div>
      <h4 className="text-sm font-black text-white/80 uppercase tracking-wider mb-1">{title}</h4>
      <p className="text-[11px] text-white/50 max-w-[220px] leading-relaxed">{description}</p>
    </div>
  );
}
