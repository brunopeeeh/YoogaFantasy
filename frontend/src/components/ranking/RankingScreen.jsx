import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { buscarRankingGlobal } from '../../services/rankingService';
import { Trophy, ArrowLeft } from 'lucide-react';
import { AVATAR_FALLBACK } from '../../design/tokens';

function MedalBadge({ posicao }) {
  if (posicao === 1) return <span className="w-6 h-6 rounded-full bg-fifa-gold text-black flex items-center justify-center text-xs font-black">1</span>;
  if (posicao === 2) return <span className="w-6 h-6 rounded-full bg-gray-300 text-black flex items-center justify-center text-xs font-black">2</span>;
  if (posicao === 3) return <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black">3</span>;
  return <span className="w-6 h-6 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-[10px] font-bold">{posicao}</span>;
}

export default function RankingScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    buscarRankingGlobal()
      .then(data => setRanking(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-[1000px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <Trophy size={24} className="text-fifa-gold" />
          <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-widest">
            Ranking Global
          </h1>
          <span className="text-[10px] text-white/40 font-bold bg-white/5 px-2 py-1 rounded-lg">
            {ranking.length} treinadores
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fifa-gold" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-sm">
            Nenhum time pontuou ainda.
          </div>
        ) : (
          <div className="bg-fifa-navy-900/40 rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/20 text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 border-b border-white/5">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 font-medium w-12">#</th>
                    <th className="px-3 sm:px-6 py-3 font-medium">Time / Treinador</th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-right hidden sm:table-cell">Última</th>
                    <th className="px-3 sm:px-6 py-3 font-medium text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((item) => {
                    const isMe = item.usuario_id === user?.id;
                    return (
                      <tr
                        key={item.usuario_id}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                          isMe ? 'bg-fifa-gold/5 border-fifa-gold/20' : ''
                        }`}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <MedalBadge posicao={item.posicao} />
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.avatar_url || AVATAR_FALLBACK}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover bg-fifa-navy-900 border border-white/10 hidden sm:block"
                              onError={(e) => { e.currentTarget.src = AVATAR_FALLBACK; }}
                            />
                            <div className="min-w-0">
                              <div className={`font-bold text-xs sm:text-sm truncate max-w-[160px] sm:max-w-[250px] ${
                                isMe ? 'text-fifa-gold' : 'text-white'
                              }`}>
                                {item.nome_time}
                                {isMe && <span className="ml-1.5 text-[9px] text-fifa-gold/60 uppercase tracking-wider">(Você)</span>}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-white/50 truncate max-w-[160px] sm:max-w-[250px]">
                                {item.nome_exibicao}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right hidden sm:table-cell">
                          <span className="text-xs text-white/50 font-mono">
                            {item.ultima_rodada_pontos}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <span className={`font-display text-base sm:text-lg font-bold ${
                            isMe ? 'text-fifa-gold' : 'text-stat-fit'
                          }`}>
                            {item.pontos}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
