// Campo de futebol usando SVG real perspectivado (transferir.svg)
// Os slots de jogadores são posicionados de forma absoluta sobre o SVG,
// respeitando a geometria trapezoidal (topo estreito = GOL, base larga = ATA/Banco).

import React from 'react';

/**
 * Mapeamento de posição Y de cada linha sobre o SVG (viewBox 522x464).
 * Campo jogável: Y≈60 (topo) a Y≈357 (linha do banco).
 * Convertido em percentual do container total (height=100%).
 *
 * GOL:  Y ≈ 82  → 82/464 ≈ 17.7%
 * DEF:  Y ≈ 152 → 152/464 ≈ 32.8%
 * MEI:  Y ≈ 220 → 220/464 ≈ 47.4%
 * ATA:  Y ≈ 295 → 295/464 ≈ 63.6%
 *
 * A largura de cada linha também estreita conforme sobe (trapézio).
 * No topo a "janela" jogável é ~41% da largura total; na base é ~100%.
 * Interpolamos linearmente entre esses extremos.
 */
const LINHAS_CONFIG = {
  Atacante: { topPct: 10, widthPct: 56, paddingX: 4 },
  MeioCampista: { topPct: 30, widthPct: 70, paddingX: 6 },
  Defensor: { topPct: 48, widthPct: 82, paddingX: 8 },
  Goleiro: { topPct: 65, widthPct: 44, paddingX: 16 },
  Reserva: { topPct: 80, widthPct: 72, paddingX: 8 },
};

export default function PitchField({ children }) {
  // children vêm como array de linhas, uma por posição.
  // Precisamos mapear cada filho para sua configuração de posição.
  const linhasArray = React.Children.toArray(children);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* ── SVG do campo como fundo ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/pitch.svg"
          alt="Campo de futebol"
          className="w-full h-full object-fill"
          draggable={false}
        />
      </div>

      {/* ── Overlay escuro leve para melhorar contraste dos cards ── */}
      <div className="absolute inset-0 z-0 bg-black/10 pointer-events-none" />

      {/* ── Linhas de jogadores — posicionamento absoluto sobre o SVG ── */}
      <div className="relative z-10 flex-1" style={{ minHeight: 0 }}>
        {linhasArray.map((linha, idx) => {
          const posicao = linha.props?.['data-posicao'] || 'Goleiro';
          const config = LINHAS_CONFIG[posicao] || { topPct: 50, widthPct: 70, paddingX: 8 };
          return (
            <div
              key={idx}
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{
                top: `${config.topPct}%`,
                width: `${config.widthPct}%`,
                transform: 'translateX(-50%)',
                paddingLeft: config.paddingX,
                paddingRight: config.paddingX,
              }}
            >
              {linha}
            </div>
          );
        })}
      </div>


    </div>
  );
}
