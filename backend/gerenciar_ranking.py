"""
Ranking de usuários por rodada — elenco completo (15 jogadores) + capitão.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from supabase import Client, create_client

from backend.regras_pontuacao import multiplicador_capitao

load_dotenv()


class GerenciadorRanking:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "")).strip("\"'")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip("\"'")
        self.supabase: Client = create_client(url, key)

    def _token_capitao_triplo_ativo(self, time_usuario_id: int, rodada: int) -> bool:
        res = (
            self.supabase.table("tokens_usuario")
            .select("id")
            .eq("time_usuario_id", time_usuario_id)
            .eq("tipo", "capitao_triplo")
            .eq("rodada_usado", rodada)
            .eq("disponivel", False)
            .limit(1)
            .execute()
        )
        return bool(res.data)

    def _nota_jogador_rodada(self, jogador_id: int, rodada: int) -> float:
        res = (
            self.supabase.table("scouts_atleta_rodada")
            .select("pontuacao_final_calculada")
            .eq("jogador_id", jogador_id)
            .eq("rodada", rodada)
            .limit(1)
            .execute()
        )
        if res.data:
            return float(res.data[0]["pontuacao_final_calculada"])
        return 0.0

    def calcular_pontos_time_usuario(self, time_usuario_id: int, rodada: int) -> dict:
        """
        Soma pontos dos 15 jogadores do snapshot + bônus capitão + penalidade transferências.
        """
        snapshot = (
            self.supabase.table("elenco_snapshot_rodada")
            .select("jogador_id, eh_capitao")
            .eq("time_usuario_id", time_usuario_id)
            .eq("rodada", rodada)
            .execute()
        )

        if not snapshot.data:
            elenco = (
                self.supabase.table("elencos_usuarios")
                .select("jogador_id, eh_capitao")
                .eq("time_usuario_id", time_usuario_id)
                .execute()
            )
            jogadores = elenco.data or []
        else:
            jogadores = snapshot.data

        if not jogadores:
            return {
                "pontos_jogadores": 0.0,
                "bonus_capitao": 0.0,
                "penalidade_transferencias": 0.0,
                "pontos_ganhos": 0.0,
            }

        token_triplo = self._token_capitao_triplo_ativo(time_usuario_id, rodada)
        mult = multiplicador_capitao(token_triplo)

        pontos_base = 0.0
        bonus_capitao = 0.0

        for j in jogadores:
            nota = self._nota_jogador_rodada(j["jogador_id"], rodada)
            if j.get("eh_capitao"):
                pontos_capitao = nota * mult
                pontos_base += nota
                bonus_capitao += pontos_capitao - nota
            else:
                pontos_base += nota

        time_res = (
            self.supabase.table("times_usuarios")
            .select("pontos_penalidade_transferencia")
            .eq("id", time_usuario_id)
            .limit(1)
            .execute()
        )
        penalidade = 0.0
        if time_res.data:
            penalidade = float(time_res.data[0].get("pontos_penalidade_transferencia") or 0)

        pontos_ganhos = round(pontos_base + bonus_capitao - penalidade, 2)

        return {
            "pontos_jogadores": round(pontos_base, 2),
            "bonus_capitao": round(bonus_capitao, 2),
            "penalidade_transferencias": round(penalidade, 2),
            "pontos_ganhos": pontos_ganhos,
        }

    def fechar_rodada_fantasy(self, rodada: int) -> int:
        """Calcula e persiste pontuação de todos os times na rodada."""
        print(f"🏆 Fechamento da Rodada {rodada}...")

        times = self.supabase.table("times_usuarios").select("id, nome_time").execute()
        if not times.data:
            print("📭 Nenhum time encontrado.")
            return 0

        count = 0
        for time_user in times.data:
            time_id = time_user["id"]
            nome = time_user["nome_time"]
            resultado = self.calcular_pontos_time_usuario(time_id, rodada)

            self.supabase.table("pontuacao_usuarios_rodada").upsert(
                {
                    "time_usuario_id": time_id,
                    "rodada": rodada,
                    **resultado,
                },
                on_conflict="time_usuario_id,rodada",
            ).execute()

            print(
                f"  🏅 {nome}: {resultado['pontos_ganhos']} pts "
                f"(base {resultado['pontos_jogadores']}, "
                f"cap {resultado['bonus_capitao']:+.1f}, "
                f"pen {resultado['penalidade_transferencias']:+.1f})"
            )
            count += 1

        print(f"✅ {count} time(s) pontuados na rodada {rodada}.")
        return count

    def sincronizar_ligas(self, rodada: int) -> int:
        res = self.supabase.rpc("sincronizar_pontos_ligas", {"p_rodada": rodada}).execute()
        atualizados = res.data if isinstance(res.data, int) else 0
        print(f"📊 Ligas atualizadas: {atualizados} vínculo(s).")
        return atualizados
