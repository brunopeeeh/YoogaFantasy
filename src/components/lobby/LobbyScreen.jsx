import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Plus, Shield, Trophy, User, Users } from 'lucide-react';
import { useFantasy } from '../../contexts/FantasyContext';
import { usePontuacaoRodada } from '../../hooks/usePontuacaoRodada';
import { useJogosRodada } from '../../hooks/useJogosRodada';
import { useEffect, useState } from 'react';
import { getMeuPerfil } from '../../services/perfilService';
import { buscarMinhasLigas } from '../../services/ligasService';
import PerfilModal from '../dashboard/PerfilModal';
import { useAuth } from '../../contexts/AuthContext';

function siglaTime(nome) {
  if (!nome) return '???';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 3).toUpperCase();
  return partes.map((p) => p[0]).join('').slice(0, 3).toUpperCase();
}

function formatarDataJogo(jogo) {
  if (jogo.data_local_brt) return jogo.data_local_brt;
  if (!jogo.timestamp_bruto) return 'Data a definir';
  return new Date(jogo.timestamp_bruto * 1000).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function JogoCard({ jogo }) {
  const casa = jogo.time_casa;
  const fora = jogo.time_fora;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-center text-[11px] text-gray-400 font-medium mb-3">
        {formatarDataJogo(jogo)}
        {jogo.grupo_rodada && (
          <span className="ml-2 text-gray-300">· {jogo.grupo_rodada}</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          {casa?.bandeira_url ? (
            <img src={casa.bandeira_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
              {siglaTime(casa?.nome)}
            </div>
          )}
          <span className="text-xs font-bold text-gray-800 truncate max-w-full">{siglaTime(casa?.nome)}</span>
        </div>
        <span className="text-lg font-light text-gray-300 flex-shrink-0">×</span>
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          {fora?.bandeira_url ? (
            <img src={fora.bandeira_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
              {siglaTime(fora?.nome)}
            </div>
          )}
          <span className="text-xs font-bold text-gray-800 truncate max-w-full">{siglaTime(fora?.nome)}</span>
        </div>
      </div>
    </div>
  );
}

export default function LobbyScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { time, refetch, configRodada, mercadoAbertoConfig, totalSelecionados } = useFantasy();
  const { ultimaRodada, totalTemporada } = usePontuacaoRodada();
  const rodada = configRodada?.rodada_atual;
  const { jogos, loading: carregandoJogos } = useJogosRodada(rodada);

  const [perfil, setPerfil] = useState(null);
  const [ligas, setLigas] = useState([]);
  const [carregandoLigas, setCarregandoLigas] = useState(true);
  const [perfilAberto, setPerfilAberto] = useState(false);

  useEffect(() => {
    getMeuPerfil().then(setPerfil).catch(() => { });
    buscarMinhasLigas()
      .then(setLigas)
      .catch(() => setLigas([]))
      .finally(() => setCarregandoLigas(false));
  }, []);

  const nomeExibicao = perfil?.nome_exibicao || user?.email?.split('@')[0] || 'Treinador';
  const nomeTime = time?.nome_time || 'Meu Time';
  const patrimonio = time?.banco_cartoletas != null ? Number(time.banco_cartoletas) : 100;
  const jogosPreview = jogos.slice(0, 6);

  return (
    <div className="flex-1 bg-[#eef1f5] text-gray-900 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Banner mercado */}
        <div className={`rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${mercadoAbertoConfig ? 'bg-fifa-blue text-white' : 'bg-gray-800 text-white'}`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar size={16} className="opacity-80" />
            {mercadoAbertoConfig
              ? `Mercado aberto · Rodada ${rodada ?? '?'}`
              : `Mercado fechado · Rodada ${rodada ?? '?'}`}
          </div>
          {configRodada?.deadline && mercadoAbertoConfig && (
            <span className="text-xs opacity-80">
              Fecha em {new Date(configRodada.deadline).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna perfil + escalar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-fifa-blue/20 to-fifa-gold/10" />
              <div className="px-5 pb-5 -mt-10">
                <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center mb-3">
                  <Shield size={28} className="text-fifa-blue" />
                </div>
                <h1 className="text-xl font-black text-gray-900 leading-tight">{nomeTime}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <User size={13} /> {nomeExibicao}
                </p>
                <button
                  onClick={() => setPerfilAberto(true)}
                  className="mt-3 text-xs font-bold text-fifa-blue uppercase tracking-wider hover:underline"
                >
                  Ver perfil
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Patrimônio</div>
                <div className="text-sm font-black text-gray-900 mt-1">€{patrimonio.toFixed(1)}M</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Última</div>
                <div className="text-sm font-black text-gray-900 mt-1">
                  {ultimaRodada != null ? Number(ultimaRodada.pontos_ganhos).toFixed(1) : '—'}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</div>
                <div className="text-sm font-black text-gray-900 mt-1">{totalTemporada.toFixed(0)}</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/escalar')}
              className="w-full py-4 rounded-2xl bg-[#e31837] hover:bg-[#c41230] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-red-200/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Users size={18} />
              Escalar meu time
            </button>
            {totalSelecionados < 15 && mercadoAbertoConfig && (
              <p className="text-center text-xs text-amber-600 font-medium">
                {15 - totalSelecionados} vaga(s) ainda não preenchida(s) na rodada {rodada ?? '?'}.
              </p>
            )}
          </div>

          {/* Coluna ligas + jogos */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-black text-gray-900 flex items-center gap-2">
                  <Trophy size={18} className="text-fifa-gold" />
                  Minhas ligas
                </h2>
                <button
                  onClick={() => navigate('/ligas')}
                  className="text-xs font-bold text-fifa-blue uppercase tracking-wider hover:underline flex items-center gap-0.5"
                >
                  Ver todas <ChevronRight size={14} />
                </button>
              </div>

              <div className="p-5">
                {carregandoLigas ? (
                  <div className="py-8 text-center text-sm text-gray-400 animate-pulse">Carregando ligas...</div>
                ) : ligas.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-gray-500 mb-4">Você ainda não participa de nenhuma liga.</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => navigate('/ligas', { state: { aba: 'criar' } })}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-fifa-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-[#007AB0] transition-colors"
                      >
                        <Plus size={14} /> Criar liga
                      </button>
                      <button
                        onClick={() => navigate('/ligas', { state: { aba: 'entrar' } })}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
                      >
                        Entrar com código
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {ligas.slice(0, 4).map((liga) => (
                      <li key={liga.id}>
                        <button
                          onClick={() => navigate('/ligas')}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-fifa-blue/30 hover:bg-fifa-blue/5 transition-colors text-left group"
                        >
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{liga.nome}</div>
                            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{liga.tipo}</div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-fifa-blue" />
                        </button>
                      </li>
                    ))}
                    <button
                      onClick={() => navigate('/ligas', { state: { aba: 'criar' } })}
                      className="w-full mt-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider hover:border-fifa-blue hover:text-fifa-blue transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Nova liga
                    </button>
                  </ul>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-900 flex items-center gap-2">
                  <Calendar size={18} className="text-fifa-blue" />
                  Jogos da rodada {rodada ?? '?'}
                </h2>
              </div>

              {carregandoJogos ? (
                <div className="py-12 text-center text-sm text-gray-400 animate-pulse">Carregando jogos...</div>
              ) : jogosPreview.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                  Nenhum jogo cadastrado para esta rodada.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {jogosPreview.map((jogo) => (
                    <JogoCard key={jogo.id_sofascore} jogo={jogo} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <PerfilModal
        isOpen={perfilAberto}
        onClose={() => setPerfilAberto(false)}
        user={user}
        time={time}
        onSaved={async () => {
          await refetch();
          const p = await getMeuPerfil().catch(() => null);
          if (p) setPerfil(p);
        }}
      />
    </div>
  );
}
