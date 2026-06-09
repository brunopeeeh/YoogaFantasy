// Skeleton placeholder para o PlayerCard durante carregamento.

import React from 'react';

export default function PlayerCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3.5 bg-fifa-navy-800/50 rounded-xl border border-white/5">
      <div className="flex items-center gap-3 w-1/3 min-w-[130px]">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-3/4 rounded bg-white/10 animate-pulse" />
          <div className="h-2 w-1/2 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="flex items-center justify-between flex-1 px-2">
        <div className="w-10 h-3 rounded bg-white/10 animate-pulse" />
        <div className="w-16 h-6 rounded bg-white/10 animate-pulse" />
        <div className="w-8 h-3 rounded bg-white/10 animate-pulse" />
        <div className="w-8 h-3 rounded bg-white/10 animate-pulse" />
        <div className="w-12 h-3 rounded bg-white/10 animate-pulse" />
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-4 h-3 rounded-sm bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
