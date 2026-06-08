import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useJogosCopa() {
  const [jogosPorSelecao, setJogosPorSelecao] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJogos() {
      try {
        const { data, error } = await supabase
          .from('jogos_copa')
          .select(`
            id_sofascore,
            rodada_numero,
            time_casa_id,
            time_fora_id,
            timestamp_bruto,
            time_casa:selecoes!time_casa_id(id, nome, bandeira_url),
            time_fora:selecoes!time_fora_id(id, nome, bandeira_url)
          `)
          .order('timestamp_bruto', { ascending: true });

        if (error) throw error;

        // Agrupar jogos por id de seleção
        const map = {};
        for (const jogo of (data || [])) {
          const addGame = (teamId, opponentTeam) => {
            if (!map[teamId]) map[teamId] = { proximo: null, jogos: [] };
            
            // Lógica de nível do oponente pode ser refinada depois. Por enquanto mock 'medium' ou aleatório simples
            // O importante é exibir a flag correta.
            map[teamId].jogos.push({
              nome: opponentTeam.nome,
              flag: opponentTeam.bandeira_url,
              nivel: 'medium' 
            });
            
            // O primeiro jogo cronologicamente (ordenado por timestamp)
            if (!map[teamId].proximo) {
              map[teamId].proximo = opponentTeam.nome;
            }
          };

          addGame(jogo.time_casa_id, jogo.time_fora);
          addGame(jogo.time_fora_id, jogo.time_casa);
        }

        setJogosPorSelecao(map);
      } catch (err) {
        console.error('Erro ao buscar jogos da copa:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJogos();
  }, []);

  return { jogosPorSelecao, loadingJogos: loading };
}
