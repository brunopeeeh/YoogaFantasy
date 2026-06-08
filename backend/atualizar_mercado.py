"""
Atualização de preços pós-rodada e controle de mercado.
"""

from __future__ import annotations

import os

from dotenv import load_dotenv
from supabase import Client, create_client

from backend.regras_pontuacao import calcular_novo_preco

load_dotenv()


class GerenciadorMercado:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "")).strip("\"'")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip("\"'")
        self.supabase: Client = create_client(url, key)

    def atualizar_precos_jogadores(self, rodada: int) -> int:
        """Varia preços com base nos scouts da rodada."""
        scouts = (
            self.supabase.table("scouts_atleta_rodada")
            .select("jogador_id, pontuacao_final_calculada")
            .eq("rodada", rodada)
            .execute()
        )
        if not scouts.data:
            print("📭 Nenhum scout para atualizar preços.")
            return 0

        count = 0
        for scout in scouts.data:
            jogador_id = scout["jogador_id"]
            pts = float(scout["pontuacao_final_calculada"])

            jog = (
                self.supabase.table("jogadores")
                .select("preco")
                .eq("id_sofascore", jogador_id)
                .limit(1)
                .execute()
            )
            if not jog.data:
                continue

            preco_atual = float(jog.data[0]["preco"])
            novo_preco = calcular_novo_preco(preco_atual, pts)

            if novo_preco != preco_atual:
                self.supabase.table("jogadores").update({"preco": novo_preco}).eq(
                    "id_sofascore", jogador_id
                ).execute()
                count += 1

        print(f"💰 {count} preço(s) atualizados na rodada {rodada}.")
        return count

    def fechar_mercado(self) -> dict:
        res = self.supabase.rpc("fechar_mercado_rodada").execute()
        data = res.data or {}
        print(f"🔒 Mercado fechado — rodada {data.get('rodada')}")
        return data

    def abrir_proxima_rodada(self, novo_deadline: str | None = None) -> dict:
        params = {}
        if novo_deadline:
            params["p_novo_deadline"] = novo_deadline
        res = self.supabase.rpc("abrir_proxima_rodada", params).execute()
        data = res.data or {}
        print(
            f"🔓 Rodada {data.get('rodada_atual')} aberta — "
            f"deadline {data.get('deadline')}"
        )
        return data
