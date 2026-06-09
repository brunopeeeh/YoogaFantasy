// Cores e padrões de kit por seleção da Copa do Mundo 2026.
// Cada seleção recebe cor primária (corpo da camisa) e secundária (detalhes).
// pattern: 'solid' | 'stripes-v' (listras verticais) | 'stripes-h' (horizontais) | 'half' (metade/metade) | 'quarters' (quatro quadros).

const DEFAULT_KIT = { primary: '#1e3a8a', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' };

// Mapeamento de IDs/nomes comuns para as 48 seleções da Copa 2026.
// Cores baseadas nos uniformes titulares de 2024-2025.
export const kits = {
  // UEFA
  'ALE': { primary: '#ffffff', secondary: '#000000', pattern: 'horizontal', textColor: '#000000' }, // Alemanha
  'GER': { primary: '#ffffff', secondary: '#000000', pattern: 'horizontal', textColor: '#000000' },
  'FRA': { primary: '#002654', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // França
  'ESP': { primary: '#aa151b', secondary: '#f1bf00', pattern: 'solid', textColor: '#f1bf00' }, // Espanha
  'POR': { primary: '#c8102e', secondary: '#006600', pattern: 'half', textColor: '#ffffff' }, // Portugal
  'ITA': { primary: '#008fd7', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Itália
  'ING': { primary: '#ffffff', secondary: '#cf142b', pattern: 'solid', textColor: '#cf142b' }, // Inglaterra
  'ENG': { primary: '#ffffff', secondary: '#cf142b', pattern: 'solid', textColor: '#cf142b' },
  'BEL': { primary: '#e30613', secondary: '#fae042', pattern: 'solid', textColor: '#fae042' }, // Bélgica
  'HOL': { primary: '#ff6f00', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Holanda
  'NED': { primary: '#ff6f00', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' },
  'CRO': { primary: '#cd0e2d', secondary: '#ffffff', pattern: 'quarters', textColor: '#ffffff' }, // Croácia
  'DIN': { primary: '#c8102e', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Dinamarca
  'SUI': { primary: '#d52b1e', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Suíça
  'POL': { primary: '#ffffff', secondary: '#dc143c', pattern: 'horizontal', textColor: '#dc143c' }, // Polônia
  'SUE': { primary: '#006aa7', secondary: '#fecc00', pattern: 'solid', textColor: '#fecc00' }, // Suécia
  'UKR': { primary: '#ffd700', secondary: '#005bbb', pattern: 'solid', textColor: '#005bbb' }, // Ucrânia
  'AUT': { primary: '#ed2939', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Áustria
  'ESC': { primary: '#0065bd', secondary: '#ffffff', pattern: 'stripes-v', textColor: '#ffffff' }, // Escócia
  'GAL': { primary: '#d30731', secondary: '#ffffff', pattern: 'half', textColor: '#ffffff' }, // País de Gales
  'TUR': { primary: '#e30a17', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Turquia
  'CZE': { primary: '#11457e', secondary: '#ffffff', pattern: 'quarters', textColor: '#ffffff' }, // Tchéquia
  'SRB': { primary: '#c7363d', secondary: '#0c4076', pattern: 'horizontal', textColor: '#ffffff' }, // Sérvia
  'NOR': { primary: '#ba0c2f', secondary: '#002868', pattern: 'quarters', textColor: '#ffffff' }, // Noruega

  // CONMEBOL
  'BRA': { primary: '#ffdf00', secondary: '#009739', pattern: 'solid', textColor: '#009739' }, // Brasil
  'ARG': { primary: '#75aadb', secondary: '#ffffff', pattern: 'stripes-v', textColor: '#ffffff' }, // Argentina
  'URU': { primary: '#0038a8', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Uruguai
  'COL': { primary: '#fcd116', secondary: '#003893', pattern: 'half', textColor: '#003893' }, // Colômbia
  'CHI': { primary: '#d52b1e', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Chile
  'PAR': { primary: '#d52b1e', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Paraguai
  'PER': { primary: '#d91023', secondary: '#ffffff', pattern: 'vertical-stripe', textColor: '#ffffff' }, // Peru
  'EQU': { primary: '#fcd116', secondary: '#003893', pattern: 'horizontal', textColor: '#003893' }, // Equador
  'BOL': { primary: '#007934', secondary: '#f9e300', pattern: 'horizontal', textColor: '#f9e300' }, // Bolívia
  'VEN': { primary: '#800020', secondary: '#00247d', pattern: 'horizontal', textColor: '#ffffff' }, // Venezuela

  // CONCACAF
  'MEX': { primary: '#006847', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // México
  'EUA': { primary: '#ffffff', secondary: '#bf0a30', pattern: 'stripes-v', textColor: '#bf0a30' }, // EUA
  'USA': { primary: '#ffffff', secondary: '#bf0a30', pattern: 'stripes-v', textColor: '#bf0a30' },
  'CAN': { primary: '#ff0000', secondary: '#ffffff', pattern: 'quarters', textColor: '#ffffff' }, // Canadá
  'CRC': { primary: '#002b7f', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Costa Rica
  'PAN': { primary: '#ffffff', secondary: '#005aa7', pattern: 'quarters', textColor: '#005aa7' }, // Panamá
  'JAM': { primary: '#009b3a', secondary: '#fed100', pattern: 'quarters', textColor: '#000000' }, // Jamaica
  'HON': { primary: '#0073cf', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Honduras

  // CAF
  'MAR': { primary: '#c1272d', secondary: '#006233', pattern: 'solid', textColor: '#ffffff' }, // Marrocos
  'SEN': { primary: '#00853f', secondary: '#fdef42', pattern: 'horizontal', textColor: '#fdef42' }, // Senegal
  'NIG': { primary: '#008751', secondary: '#ffffff', pattern: 'vertical-stripe', textColor: '#ffffff' }, // Nigéria
  'NGA': { primary: '#008751', secondary: '#ffffff', pattern: 'vertical-stripe', textColor: '#ffffff' },
  'EGI': { primary: '#ce1126', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' }, // Egito
  'EGY': { primary: '#ce1126', secondary: '#ffffff', pattern: 'horizontal', textColor: '#ffffff' },
  'GAN': { primary: '#fcd116', secondary: '#006b3f', pattern: 'horizontal', textColor: '#000000' }, // Gana
  'GHA': { primary: '#fcd116', secondary: '#006b3f', pattern: 'horizontal', textColor: '#000000' },
  'CAM': { primary: '#007a5e', secondary: '#ce1126', pattern: 'vertical-stripe', textColor: '#fcd116' }, // Camarões
  'TUN': { primary: '#e70013', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Tunísia
  'ALG': { primary: '#006233', secondary: '#ffffff', pattern: 'vertical-stripe', textColor: '#ffffff' }, // Argélia
  'CIV': { primary: '#f77f00', secondary: '#009e60', pattern: 'vertical-stripe', textColor: '#ffffff' }, // Costa do Marfim
  'RSA': { primary: '#007749', secondary: '#ffb81c', pattern: 'horizontal', textColor: '#ffb81c' }, // África do Sul
  'COD': { primary: '#007fff', secondary: '#f7d518', pattern: 'quarters', textColor: '#f7d518' }, // RD Congo

  // AFC
  'JAP': { primary: '#ffffff', secondary: '#bc002d', pattern: 'solid', textColor: '#bc002d' }, // Japão
  'JPN': { primary: '#ffffff', secondary: '#bc002d', pattern: 'solid', textColor: '#bc002d' },
  'COR': { primary: '#cd2e3a', secondary: '#0047a0', pattern: 'solid', textColor: '#ffffff' }, // Coreia do Sul
  'KOR': { primary: '#cd2e3a', secondary: '#0047a0', pattern: 'solid', textColor: '#ffffff' },
  'IRA': { primary: '#ffffff', secondary: '#239f40', pattern: 'horizontal', textColor: '#239f40' }, // Irã
  'ARA': { primary: '#006c35', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Arábia Saudita
  'KSA': { primary: '#006c35', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' },
  'AUS': { primary: '#ffcd00', secondary: '#00843d', pattern: 'solid', textColor: '#00843d' }, // Austrália
  'QAT': { primary: '#8d1b3d', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Catar

  // OFC
  'NZL': { primary: '#000000', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' }, // Nova Zelândia
  'NEW': { primary: '#000000', secondary: '#ffffff', pattern: 'solid', textColor: '#ffffff' },
};

// Match por nome (case-insensitive) quando não temos sigla.
const KITS_POR_NOME = Object.fromEntries(
  Object.entries(kits).map(([k, v]) => [k, v])
);

export function getKit(selecaoSigla, selecaoNome) {
  if (!selecaoSigla && !selecaoNome) return DEFAULT_KIT;
  const sigla = String(selecaoSigla || '').toUpperCase();
  if (kits[sigla]) return kits[sigla];
  // Tenta matchar por nome
  if (selecaoNome) {
    const nomeUpper = String(selecaoNome).toUpperCase();
    for (const [k, v] of Object.entries(kits)) {
      if (nomeUpper.includes(k) || k.includes(nomeUpper.slice(0, 3))) return v;
    }
  }
  return DEFAULT_KIT;
}

export { DEFAULT_KIT };
