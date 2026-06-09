import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Wallet, Award, Star,
  TrendingUp, Users, Zap, FileText, Info, Calendar
} from 'lucide-react';

export default function RulesScreen() {
  const navigate = useNavigate();

  // Variantes para animações de entrada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#001D35] text-white w-full pb-16 overflow-y-auto selection:bg-fifa-gold selection:text-black">
      {/* Banner de Cabeçalho / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-fifa-navy-950 to-fifa-navy-900 border-b border-white/10 pt-8 pb-12 px-4 sm:px-6 md:px-12">
        {/* Background Decorative Circles */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#009CDE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-fifa-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
          {/* Botão Voltar */}
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider w-fit bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10"
          >
            <ArrowLeft size={16} className="text-fifa-gold" />
            Voltar
          </motion.button>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] sm:text-xs font-black text-[#009CDE] uppercase tracking-[3px] font-heading">
              Central de Ajuda & Regulamento
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight uppercase tracking-wide font-display">
              Regulamento <span className="text-fifa-gold">Yooga Fantasy</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed mt-2 font-medium">
              Conheça as regras oficiais sobre montagem de elenco, gerenciamento de titulares, prazos de transferência por rodada, tokens e a matriz de pontuação completa baseada em 30 scouts.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Central */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 flex flex-col gap-8"
      >

        {/* Seção 1: Seleção do elenco */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-fifa-gold/15 border border-fifa-gold/30 rounded-lg text-fifa-gold">
              <Wallet size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none">Capítulo 1</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Seleção do Elenco
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
            <p>
              Para inscrever seu time de futebol Fantasy em uma competição existente, você precisa criar um time de <strong>15 jogadores</strong> composto obrigatoriamente por:
            </p>

            <div className="bg-[#11161d] rounded-lg p-4 border border-white/5 flex flex-col gap-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="text-lg font-black text-white font-mono">2</div>
                  <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Goleiros</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="text-lg font-black text-white font-mono">5</div>
                  <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Defensores</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="text-lg font-black text-white font-mono">5</div>
                  <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Meio-Campistas</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="text-lg font-black text-white font-mono">3</div>
                  <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Atacantes</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p>
                <strong className="text-white">Posições do jogador:</strong> Os jogadores têm uma única posição atribuída com base na função mais comum deles em competições recentes. Eles marcarão pontos para essa posição durante todo o torneio, mesmo que sua função mude na vida real.
              </p>
              <p>
                <strong className="text-white">Orçamento:</strong> Você pode selecionar seu elenco inicial dentro de um orçamento de <strong>R$150 milhões</strong>. Qualquer dinheiro não utilizado é colocado automaticamente no seu banco e estará disponível para transferências futuras.
              </p>
              <p className="bg-[#009CDE]/10 border border-[#009CDE]/20 text-gray-200 p-3 rounded-lg text-xs flex items-center gap-2">
                <Info size={16} className="text-[#009CDE] shrink-0" />
                <span>Assim que a fase de grupos terminar, seu orçamento aumenta em <strong>R$10 milhões</strong> de forma automática ao abrir as transferências da fase de mata-mata.</span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Seção 2: Gerenciamento do elenco */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-[#009CDE]/15 border border-[#009CDE]/30 rounded-lg text-[#009CDE]">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#009CDE] uppercase tracking-widest leading-none">Capítulo 2</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Gerenciamento do Elenco
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
            <p>
              Seu elenco sempre consiste em 15 jogadores. A cada rodada, você seleciona <strong>15</strong> para entrar em campo. Utilizamos 15, pois são os 11 titulares e 4 reservas. Apenas os pontos conquistados pelos seus 11 jogadores escalados no final da rodada contarão para a sua pontuação.
            </p>

            <div className="border border-white/5 bg-white/5 rounded-lg p-4">
              <div>
                <span className="text-xs font-black text-fifa-gold uppercase tracking-wide flex items-center gap-1">
                  <Star size={14} className="text-fifa-gold mt-[-2px]" /> Escolhendo um Capitão
                </span>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Escolha um jogador do seu 15 iniciais para ser o capitão. Os pontos dele serão <strong>dobrados (x2)</strong> naquela rodada. Você pode mudar a braçadeira de capitão para qualquer jogador do seu 15 inicial cujo jogo ainda não tenha começado.
                  <br />
                  <span className="text-white/40 block mt-1 font-semibold">* Lembre-se: uma vez que você altera o capitão, não pode voltar atrás caso o mercado esteja fechado.</span>
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Seção 3: Tokens */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-teal-500/15 border border-teal-500/30 rounded-lg text-teal-400">
              <Zap size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest leading-none">Capítulo 3</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Tokens Especiais
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Tokens são bônus especiais de uso único que você pode ativar para maximizar os pontos do seu elenco. Escolha o momento ideal:
            </p>

            <div className="flex gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 border border-amber-500/30 text-amber-400">
                <Star size={18} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wide">Capitão Triplo</span>
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black px-1.5 py-0.5 rounded uppercase font-mono">1x por Copa</span>
                </div>
                <p className="text-xs text-gray-300 mt-1 font-medium leading-relaxed">
                  Seu capitão normalmente marca o dobro de pontos. Com o token ativo, ele marcará o <strong>triplo (x3)</strong> em vez disso.
                  Deve ser ativado antes do período de transferência da rodada terminar. Uma vez ativo, você pode reatribuí-lo a qualquer jogador desbloqueado em seu elenco.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Seção 4: Deadlines (Prazos) */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400">
              <Calendar size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest leading-none">Capítulo 4</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Prazos das Rodadas (Deadlines)
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
            <p>
              Cada rodada tem um prazo limite rígido de <strong>30 minutos antes do início da primeira partida</strong>. Após este prazo, nenhuma alteração de elenco ou transferência será permitida para a rodada em andamento.
            </p>
            <p>
              O torneio é composto por <strong>8 rodadas</strong> no total (com a Final e a disputa do 3º lugar compondo a última rodada):
            </p>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-[#11161d]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Etapa / Rodada</th>
                    <th className="p-3">Data</th>
                    <th className="p-3 text-right">Horário (CET)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-semibold text-white">Rodada 1</td>
                    <td className="p-3">Jun 11</td>
                    <td className="p-3 text-right font-mono">20:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Rodada 2</td>
                    <td className="p-3">Jun 18</td>
                    <td className="p-3 text-right font-mono">17:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Rodada 3</td>
                    <td className="p-3">Jun 24</td>
                    <td className="p-3 text-right font-mono">20:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">16Avos-de-final</td>
                    <td className="p-3">Jun 28</td>
                    <td className="p-3 text-right font-mono">20:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Oitavos-de-Final</td>
                    <td className="p-3">Jul 4</td>
                    <td className="p-3 text-right font-mono">18:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Quartas de final</td>
                    <td className="p-3">Jul 9</td>
                    <td className="p-3 text-right font-mono">21:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Semifinais</td>
                    <td className="p-3">Jul 14</td>
                    <td className="p-3 text-right font-mono">20:30</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Final e 3º lugar</td>
                    <td className="p-3">Jul 18</td>
                    <td className="p-3 text-right font-mono">22:30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Seção 5: Transferências */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-stat-fit/15 border border-stat-fit/30 rounded-lg text-stat-fit">
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-stat-fit uppercase tracking-widest leading-none">Capítulo 5</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Transferências e Mercado
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
            <p>
              O número de transferências e a quantidade de atletas permitidos do mesmo time real variam de acordo com o estágio do campeonato.
            </p>

            <div className="border border-white/5 rounded-lg overflow-hidden bg-[#11161d] mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Fase do Torneio</th>
                    <th className="p-3 text-center">Nº de Transferências</th>
                    <th className="p-3 text-right">Máx. do mesmo país</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes do torneio</td>
                    <td className="p-3 text-center text-stat-fit font-bold">Ilimitadas</td>
                    <td className="p-3 text-right font-mono">3</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Fase de grupos</td>
                    <td className="p-3 text-center font-bold">3 por rodada</td>
                    <td className="p-3 text-right font-mono">3</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes dos 16avos</td>
                    <td className="p-3 text-center text-stat-fit font-bold">Ilimitadas</td>
                    <td className="p-3 text-right font-mono">3</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes das oitavas</td>
                    <td className="p-3 text-center font-bold">5</td>
                    <td className="p-3 text-right font-mono">4</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes das quartas</td>
                    <td className="p-3 text-center font-bold">5</td>
                    <td className="p-3 text-right font-mono">5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes das semifinais</td>
                    <td className="p-3 text-center font-bold">5</td>
                    <td className="p-3 text-right font-mono">6</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Antes da final/3º lugar</td>
                    <td className="p-3 text-center font-bold">5</td>
                    <td className="p-3 text-right font-mono">7</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong className="text-white">Preços dos Jogadores:</strong> Os preços oscilam baseados na fase, desempenho real e demanda (quantidade de técnicos que contratam ou vendem o atleta). Os preços são atualizados após cada prazo limite e no término de cada rodada.
            </p>
          </div>
        </motion.section>

        {/* Seção 6: Pontuação */}
        <motion.section variants={itemVariants} className="bg-fifa-navy-900/60 backdrop-blur-glass border border-white/10 rounded-xl p-6 sm:p-8 shadow-glass hover:border-white/15 transition-all">
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Award size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Capítulo 6</span>
              <h2 className="text-xl font-black text-white uppercase tracking-wider leading-tight">
                Critérios de Pontuação (Scouts)
              </h2>
            </div>
          </div>

          <div className="space-y-6 text-sm text-gray-300 font-medium">
            <p className="leading-relaxed">
              O Yooga Fantasy calcula e atribui pontos aos atletas com base em seus desempenhos reais em campo, avaliando 30 categorias estatísticas ponderadas por posição.
            </p>

            {/* Tabela dos 30 scouts */}
            <div className="border border-white/5 rounded-lg overflow-hidden bg-[#11161d]">
              <div className="bg-white/5 px-4 py-2.5 text-xs font-black text-white uppercase tracking-wider border-b border-white/10 flex items-center gap-1.5 bg-fifa-navy-950/40">
                <FileText size={14} className="text-fifa-gold" />
                Matriz Completa de Scouts
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-white/10 text-[11px] whitespace-nowrap sm:whitespace-normal">
                  <thead>
                    <tr className="border-b border-white/10 text-white/70 uppercase tracking-wider text-[10px] bg-white/5 font-sans">
                      <th className="py-2 px-3 border-r border-white/10">Nome da estatística</th>
                      <th className="py-2 px-3 text-center border-r border-white/10 w-16 sm:w-20">GKP</th>
                      <th className="py-2 px-3 text-center border-r border-white/10 w-16 sm:w-20">DEF</th>
                      <th className="py-2 px-3 text-center border-r border-white/10 w-16 sm:w-20">MID</th>
                      <th className="py-2 px-3 text-center w-16 sm:w-20">FWD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 font-mono">
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-bold font-sans text-white border-r border-white/10">Nota Yooga Fantasy</td>
                      <td className="py-1.5 px-3 text-center text-fifa-gold font-bold" colSpan="4">De -2 a 3 pontos</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Gol Marcado</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+6</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+6</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+5</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+4</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Assistência</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+4</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+4</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+3</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+3</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Gol Contra</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-2 pontos</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Cartão Amarelo</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-1 ponto</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Segundo Cartão Amarelo</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">De -1 a -3 (por minuto)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Cartão Vermelho Direto</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">De -2 a -4 (por minuto)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Participação (Entrar / +60m)</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 ou +2 pontos</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Jogo sem sofrer gols (SG)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+4</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+4</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Gols Sofridos (A cada 2)</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold border-r border-white/10">-1</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold border-r border-white/10">-1</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Pênalti Defendido</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+5</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Pênalti Sofrido</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold" colSpan="4">+2 pontos</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Pênalti Cometido</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-2 pontos</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Pênalti Perdido</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-3 pontos</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Defesas (de dentro da área)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 2)</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Defesas (de fora da área)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Socos + Bolas Interceptadas</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 2)</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Saídas Certas</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold">-</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Bolas Longas Precisas</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 (&ge;3 longas com acerto &ge;60%)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Tirar bola em cima da linha</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold" colSpan="4">+2 pontos</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Cortes Defensivos</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 5)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 5)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+1 (a cada 5)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Chutes Bloqueados</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 2)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 2)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+1 (a cada 2)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Interceptações</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+1 (a cada 3)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Desarmes Ganhos</td>
                      <td className="py-1.5 px-3 text-center text-white/30 font-bold border-r border-white/10">-</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+1 (a cada 3)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Duelos Ganhos</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 (&ge;3 duelos com taxa &ge;50%)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Faltas Sofridas</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1 (a cada 3)</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold border-r border-white/10">+1</td>
                      <td className="py-1.5 px-3 text-center text-stat-fit font-bold">+1</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Passe de Elite</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 (&ge;40 passes com acerto &ge;90%)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Impedimentos</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-1 (a cada 2)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Perdas de Bola</td>
                      <td className="py-1.5 px-3 text-center text-stat-injured font-bold" colSpan="4">-1 (a cada 3)</td>
                    </tr>
                    <tr className="bg-white/[0.01] hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Passes Decisivos</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 (a cada 2)</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors duration-150 cursor-default">
                      <td className="py-1.5 px-3 font-sans text-gray-300 border-r border-white/10">Dribles Certos</td>
                      <td className="py-1.5 px-3 text-center font-bold" colSpan="4">+1 (&ge;3 dribles com acerto &ge;60%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detalhamento dos scouts complexos */}
            <div className="bg-[#11161d] border border-white/5 rounded-lg p-4 space-y-4 text-xs leading-relaxed text-gray-300">
              <div>
                <strong className="text-white text-xs block mb-1">Nota Yoga Fantasy:</strong>
                Os jogadores recebem de -2 a 3 pontos Fantasy proporcionais ao valor de sua nota Yooga Fantasy calculada ao fim da partida.
              </div>
              <div className="border-t border-white/5 pt-3">
                <strong className="text-white text-xs block mb-1">Segundo Cartão Amarelo e Cartão Vermelho Proporcionais:</strong>
                Visto que uma expulsão nos estágios iniciais prejudica o time real por mais tempo, os pontos negativos variam com o tempo de jogo:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-400">
                  <li><strong>Expulsão de 0 a 29 min:</strong> -3 pts (2º Amarelo) | -4 pts (Vermelho Direto)</li>
                  <li><strong>Expulsão de 30 a 59 min:</strong> -2 pts (2º Amarelo) | -3 pts (Vermelho Direto)</li>
                  <li><strong>Expulsão de 60 a 90 min:</strong> -1 pt (2º Amarelo) | -2 pts (Vermelho Direto)</li>
                </ul>
              </div>
              <div className="border-t border-white/5 pt-3">
                <strong className="text-white text-xs block mb-1">Desarmes Ganhos:</strong>
                Considerado tackle ganho se o jogador ou sua equipe mantiver a posse após a disputa, ou se a bola for afastada de campo com segurança. Roubadas de bola que voltam para o adversário não contam neste scout.
              </div>
              <div className="border-t border-white/5 pt-3">
                <strong className="text-white text-xs block mb-1">Prazos de Oficialização:</strong>
                Visto que os scouts e notas oficiais de todas as 30 categorias são revisados detalhadamente, a oficialização final dos pontos de rodada do fantasy no banco de dados pode levar até 24 horas após o encerramento do último jogo da rodada.
              </div>
            </div>

          </div>
        </motion.section>

      </motion.div>
    </div>
  );
}
