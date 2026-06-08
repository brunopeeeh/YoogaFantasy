import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Trophy, Plus, LogIn, Users, Copy, Check, X, Pencil, Trash2 } from 'lucide-react';
import { buscarMinhasLigas, criarLiga, entrarLigaPorCodigo, buscarLeaderboard, atualizarLiga, excluirLiga } from '../../services/ligasService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import LigasErrorBoundary from './LigasErrorBoundary';

export default function LigasScreen() {
  const location = useLocation();
  const { user } = useAuth();
  const [minhasLigas, setMinhasLigas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('minhas');

  useEffect(() => {
    if (location.state?.aba) {
      setAbaAtiva(location.state.aba);
    }
  }, [location.state?.aba]);

  // Leaderboard modal state
  const [ligaSelecionada, setLigaSelecionada] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [carregandoRanking, setCarregandoRanking] = useState(false);

  // Form states
  const [nomeLiga, setNomeLiga] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [processando, setProcessando] = useState(false);

  // Success state after creating a league
  const [ligaCriada, setLigaCriada] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Edit / Delete state
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const carregarLigas = async () => {
    setCarregando(true);
    try {
      const ligas = await buscarMinhasLigas();
      setMinhasLigas(ligas);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar suas ligas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLigas();
  }, []);

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!nomeLiga.trim()) return;
    setProcessando(true);
    try {
      const liga = await criarLiga(nomeLiga);
      setLigaCriada(liga);
      setNomeLiga('');
    } catch (error) {
      toast.error(error.message || 'Erro ao criar liga.');
    } finally {
      setProcessando(false);
    }
  };

  const handleFecharLigaCriada = () => {
    setLigaCriada(null);
    setAbaAtiva('minhas');
    carregarLigas();
  };

  const handleCopiarCodigo = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error('Erro ao copiar código.');
    }
  };

  const handleEntrar = async (e) => {
    e.preventDefault();
    if (!codigoConvite.trim()) return;
    setProcessando(true);
    try {
      await entrarLigaPorCodigo(codigoConvite);
      toast.success('Você entrou na liga!');
      setCodigoConvite('');
      setAbaAtiva('minhas');
      await carregarLigas();
    } catch (error) {
      toast.error(error.message || 'Erro ao entrar na liga.');
    } finally {
      setProcessando(false);
    }
  };

  const abrirRanking = async (liga) => {
    setLigaSelecionada(liga);
    setCarregandoRanking(true);
    try {
      const ranking = await buscarLeaderboard(liga.id);
      setLeaderboard(ranking);
    } catch (error) {
      toast.error('Erro ao carregar o ranking.');
    } finally {
      setCarregandoRanking(false);
    }
  };

  const handleEditarNome = async () => {
    if (!novoNome.trim() || novoNome === ligaSelecionada.nome) {
      setEditandoNome(false);
      return;
    }
    try {
      const atualizada = await atualizarLiga(ligaSelecionada.id, { nome: novoNome });
      setLigaSelecionada(prev => ({ ...prev, nome: atualizada.nome }));
      setEditandoNome(false);
      toast.success('Nome atualizado!');
      carregarLigas();
    } catch (error) {
      toast.error(error.message || 'Erro ao atualizar nome.');
    }
  };

  const handleExcluirLiga = async () => {
    try {
      await excluirLiga(ligaSelecionada.id);
      toast.success('Liga excluída.');
      setConfirmandoExclusao(false);
      setLigaSelecionada(null);
      carregarLigas();
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir liga.');
    }
  };

  const ehCriador = ligaSelecionada && user && ligaSelecionada.criado_por === user.id;

  return (
    <LigasErrorBoundary>
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10">

      {ligaSelecionada ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setLigaSelecionada(null)}
            className="text-fifa-gold text-xs font-bold uppercase tracking-wider mb-4 hover:underline"
          >
            &larr; Voltar para ligas
          </button>

          <div className="bg-fifa-navy-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-white/5 bg-white/5">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  {editandoNome ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        maxLength={30}
                        className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-lg sm:text-2xl font-display w-full focus:outline-none focus:border-fifa-gold"
                        autoFocus
                      />
                      <button
                        onClick={handleEditarNome}
                        className="bg-stat-fit hover:bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setEditandoNome(false); setNovoNome(ligaSelecionada.nome); }}
                        className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-lg sm:text-2xl font-display text-white truncate">{ligaSelecionada.nome}</h2>
                  )}
                  <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-wider mt-1 flex items-center gap-2 flex-wrap">
                    <span className="bg-white/10 px-2 py-0.5 rounded">{ligaSelecionada.tipo}</span>
                    {ligaSelecionada.codigo_convite && (
                      <span className="flex items-center gap-1.5">
                        CÓDIGO:
                        <strong className="text-white">{ligaSelecionada.codigo_convite}</strong>
                        <button
                          onClick={() => handleCopiarCodigo(ligaSelecionada.codigo_convite)}
                          className="text-white/40 hover:text-fifa-gold transition-colors p-1"
                          title="Copiar código"
                          aria-label="Copiar código de convite"
                        >
                          {copiado ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ehCriador && !editandoNome && (
                    <>
                      <button
                        onClick={() => { setNovoNome(ligaSelecionada.nome); setEditandoNome(true); }}
                        className="text-white/50 hover:text-fifa-gold transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Editar nome"
                        aria-label="Editar nome da liga"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmandoExclusao(true)}
                        className="text-white/50 hover:text-red-400 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Excluir liga"
                        aria-label="Excluir liga"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <Trophy size={28} className="sm:w-8 sm:h-8 text-fifa-gold opacity-50 flex-shrink-0" />
                </div>
              </div>
            </div>

            <div className="p-0">
              {carregandoRanking ? (
                <div className="p-10 text-center text-white/50 animate-pulse">Carregando classificação...</div>
              ) : leaderboard.length === 0 ? (
                <div className="p-10 text-center text-white/50">Nenhum time pontuou ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 border-b border-white/5">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 font-medium">#</th>
                      <th className="px-3 sm:px-6 py-3 font-medium">Time / Treinador</th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, index) => (
                      <tr key={item.usuario_id} className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${index === 0 ? 'bg-fifa-gold/5' : ''}`}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${index === 0 ? 'bg-fifa-gold text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white'}`}>
                            {item.posicao}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-bold text-white text-xs sm:text-sm truncate max-w-[140px] sm:max-w-none">{item.nome_time}</div>
                          <div className="text-[9px] sm:text-[10px] text-white/50 truncate max-w-[140px] sm:max-w-none">{item.nome_exibicao}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="font-display text-base sm:text-lg text-stat-fit">{item.pontos}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setAbaAtiva('minhas')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap px-2 transition-colors border-b-2 ${abaAtiva === 'minhas' ? 'text-fifa-gold border-fifa-gold' : 'text-white/50 border-transparent hover:text-white'}`}
            >
              Minhas Ligas
            </button>
            <button
              onClick={() => setAbaAtiva('entrar')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap px-2 transition-colors border-b-2 flex items-center gap-1.5 ${abaAtiva === 'entrar' ? 'text-fifa-gold border-fifa-gold' : 'text-white/50 border-transparent hover:text-white'}`}
            >
              <LogIn size={14} /> Entrar com Código
            </button>
            <button
              onClick={() => setAbaAtiva('criar')}
              className={`pb-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap px-2 transition-colors border-b-2 flex items-center gap-1.5 ${abaAtiva === 'criar' ? 'text-fifa-gold border-fifa-gold' : 'text-white/50 border-transparent hover:text-white'}`}
            >
              <Plus size={14} /> Criar Liga
            </button>
          </div>

          {abaAtiva === 'minhas' && (
            <div className="space-y-4">
              {carregando ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
                </div>
              ) : minhasLigas.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center flex flex-col items-center">
                  <Trophy size={48} className="text-white/20 mb-4" />
                  <h3 className="text-xl font-display text-white mb-2">Nenhuma liga encontrada</h3>
                  <p className="text-sm text-white/60 max-w-md mx-auto mb-6">
                    Você ainda não participa de nenhuma liga. Crie sua própria liga para competir com amigos ou entre em uma usando um código de convite!
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => setAbaAtiva('entrar')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                      Entrar em Liga
                    </button>
                    <button onClick={() => setAbaAtiva('criar')} className="bg-fifa-blue hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                      Criar Liga
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {minhasLigas.map(liga => (
                    <button
                      key={liga.id}
                      onClick={() => abrirRanking(liga)}
                      className="bg-fifa-navy-900 border border-white/10 rounded-xl p-5 text-left hover:border-white/20 transition-colors group flex flex-col h-full"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-fifa-blue/20 flex items-center justify-center">
                          <Trophy size={20} className="text-fifa-blue" />
                        </div>
                        {liga.tipo === 'privada' && (
                          <span className="text-[10px] uppercase tracking-wider bg-black/30 text-white/50 px-2 py-1 rounded">Privada</span>
                        )}
                      </div>

                      <h3 className="font-display text-xl text-white mb-1 line-clamp-1">{liga.nome}</h3>
                      <div className="text-xs text-white/50 flex items-center gap-1.5 mb-6">
                        <Users size={12} /> Rankeamento Ativo
                      </div>

                      <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Seus Pontos</div>
                          <div className="font-bold text-white text-lg leading-none">{liga.meus_pontos}</div>
                        </div>
                        <div className="text-xs font-bold text-fifa-gold uppercase tracking-wider">
                          Ver Ranking &rarr;
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {abaAtiva === 'entrar' && (
            <div className="max-w-md">
              <h2 className="text-2xl font-display text-white mb-2">Entrar em uma Liga</h2>
              <p className="text-sm text-white/60 mb-6">Insira o código de convite de 6 caracteres que o criador da liga compartilhou com você.</p>

              <form onSubmit={handleEntrar} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Código de Convite</label>
                  <input
                    type="text"
                    placeholder="EX: ABC123"
                    value={codigoConvite}
                    onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-fifa-blue transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={processando || codigoConvite.length < 5}
                  className="w-full bg-stat-fit hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-stat-fit text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
                >
                  {processando ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Entrar na Liga'}
                </button>
              </form>
            </div>
          )}

          {abaAtiva === 'criar' && (
            <div className="max-w-md">
              <h2 className="text-2xl font-display text-white mb-2">Criar sua Liga</h2>
              <p className="text-sm text-white/60 mb-6">Crie uma liga privada para competir exclusivamente com seus amigos. Você receberá um código para convidá-los depois.</p>

              <form onSubmit={handleCriar} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Nome da Liga</label>
                  <input
                    type="text"
                    placeholder="Ex: Liga dos Campeões da Firma"
                    value={nomeLiga}
                    onChange={(e) => setNomeLiga(e.target.value)}
                    maxLength={30}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-stat-fit transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={processando || !nomeLiga.trim()}
                  className="w-full bg-stat-fit hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-stat-fit text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
                >
                  {processando ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Criar Liga Privada'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-fifa-navy-900 border border-white/10 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-display text-white">Excluir liga?</h3>
              <p className="text-sm text-white/60 mt-2">
                Tem certeza? Esta ação não pode ser desfeita. Todos os participantes serão removidos.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirLiga}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal after creating league */}
      {ligaCriada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-fifa-navy-900 border border-white/10 rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleFecharLigaCriada}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-stat-fit/20 flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} className="text-stat-fit" />
              </div>
              <h3 className="text-lg font-display text-white">Liga criada!</h3>
              <p className="text-sm text-white/60 mt-1">{ligaCriada.nome}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4 text-center mb-6">
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2">
                Código de Convite
              </p>
              <p className="text-2xl font-mono font-black text-fifa-gold tracking-[0.2em] mb-3">
                {ligaCriada.codigo_convite}
              </p>
              <button
                onClick={() => handleCopiarCodigo(ligaCriada.codigo_convite)}
                className="w-full bg-fifa-blue hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {copiado ? <Check size={16} /> : <Copy size={16} />}
                {copiado ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>

            <p className="text-[11px] text-white/40 text-center mb-4">
              Compartilhe este código com seus amigos para eles entrarem na liga.
            </p>

            <button
              onClick={handleFecharLigaCriada}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
            >
              Ver minhas ligas
            </button>
          </div>
        </div>
      )}
    </div>
    </LigasErrorBoundary>
  );
}
