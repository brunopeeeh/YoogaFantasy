"""
Engine de pontuação: busca dados Sofascore e persiste scouts_atleta_rodada.
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from typing import Any

import cloudscraper
from dotenv import load_dotenv
from supabase import Client, create_client

from backend.regras_pontuacao import StatsJogador, calcular_pontos_partida

load_dotenv()

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
}

STAT_KEYS = {
    "passes": "passes_tentados",
    "accuratePasses": "passes_acertados",
    "tackles": "desarmes",
    "clearances": "cortes",
    "bigChanceCreated": "passes_decisivos",
    "dispossessed": "perdas_bola",
    "saves": "defesas",
    "interceptions": "interceptacoes",
    "blockedShots": "chutes_bloqueados",
    "duelsWon": "duelos_vencidos",
    "totalDuels": "duelos_tentados",
    "successfulDribbles": "dribles_certos",
    "totalDribbles": "dribles_tentados",
    "accurateLongBalls": "bolas_longas_certas",
    "totalLongBalls": "bolas_longas_tentadas",
    "fouls": "faltas_sofridas",
    "offsides": "impedimentos",
    "penaltySave": "penalti_defendido",
    "penaltyMiss": "penalti_perdido",
}


class EnginePontuacao:
    def __init__(self):
        url = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", "")).strip("\"'")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip("\"'")
        self.supabase: Client = create_client(url, key)
        self.scraper = cloudscraper.create_scraper()
        self._cache_posicao: dict[int, str] = {}
        self._cache_selecao: dict[int, int] = {}

    def _get_json(self, url: str, tentativa: int = 1) -> dict | None:
        max_tentativas = int(os.getenv("SOFASCORE_RETRY_MAX", "3"))
        try:
            resp = self.scraper.get(url, headers=HEADERS, timeout=30)
            if resp.status_code == 429:
                wait = 2 ** tentativa
                print(f"⏳ Rate limited ({url}), tentativa {tentativa}/{max_tentativas}, aguardando {wait}s")
                time.sleep(wait)
                if tentativa < max_tentativas:
                    return self._get_json(url, tentativa + 1)
                print(f"❌ Esgotadas tentativas por rate limit: {url}")
                return None
            if resp.status_code != 200:
                print(f"⚠️ HTTP {resp.status_code}: {url}")
                if tentativa < max_tentativas:
                    wait = 2 ** tentativa
                    print(f"   Tentativa {tentativa}/{max_tentativas}, retry em {wait}s")
                    time.sleep(wait)
                    return self._get_json(url, tentativa + 1)
                return None
            return resp.json()
        except Exception as exc:
            print(f"❌ Erro ao buscar {url}: {exc}")
            if tentativa < max_tentativas:
                wait = 2 ** tentativa
                print(f"   Tentativa {tentativa}/{max_tentativas}, retry em {wait}s")
                time.sleep(wait)
                return self._get_json(url, tentativa + 1)
            return None

    def buscar_posicao(self, jogador_id: int) -> str | None:
        if jogador_id in self._cache_posicao:
            return self._cache_posicao[jogador_id]
        res = (
            self.supabase.table("jogadores")
            .select("posicao")
            .eq("id_sofascore", jogador_id)
            .limit(1)
            .execute()
        )
        if res.data:
            pos = res.data[0]["posicao"]
            self._cache_posicao[jogador_id] = pos
            return pos
        return None

    def buscar_selecao_jogador(self, jogador_id: int) -> int | None:
        if jogador_id in self._cache_selecao:
            return self._cache_selecao[jogador_id]
        res = (
            self.supabase.table("jogadores")
            .select("selecao_id")
            .eq("id_sofascore", jogador_id)
            .limit(1)
            .execute()
        )
        if res.data:
            sel = res.data[0]["selecao_id"]
            self._cache_selecao[jogador_id] = sel
            return sel
        return None

    def _extrair_minutos(self, player: dict) -> int:
        stats = player.get("statistics") or {}
        minutes = stats.get("minutesPlayed")
        if minutes is not None:
            return int(minutes)
        return 90 if player.get("substitute") is False else 0

    def _extrair_stats_lineup(self, player: dict) -> dict[str, int | float]:
        stats = player.get("statistics") or {}
        out: dict[str, int | float] = {
            "passes_tentados": 0,
            "passes_acertados": 0,
            "desarmes": 0,
            "cortes": 0,
            "passes_decisivos": 0,
            "perdas_bola": 0,
        }
        for api_key, local_key in STAT_KEYS.items():
            val = stats.get(api_key)
            if val is not None:
                out[local_key] = int(val) if local_key != "passes_acertados" else int(val)
        passes = out["passes_tentados"]
        acertados = out.pop("passes_acertados", 0)
        out["precisao_passes"] = (acertados / passes * 100) if passes > 0 else 0.0
        return out

    def _processar_incidentes(
        self,
        incidentes: list[dict],
        acumulado: dict[int, dict],
    ) -> None:
        for inc in incidentes:
            player_info = inc.get("player") or {}
            jogador_id = player_info.get("id")
            if not jogador_id:
                continue

            if jogador_id not in acumulado:
                pos = self.buscar_posicao(jogador_id)
                if not pos:
                    continue
                acumulado[jogador_id] = {
                    "stats": StatsJogador(),
                    "posicao": pos,
                    "minuto_vermelho": None,
                }

            entry = acumulado[jogador_id]
            stats: StatsJogador = entry["stats"]
            tipo = inc.get("incidentType")
            classe = inc.get("incidentClass")
            minuto = int(inc.get("time") or 0)

            if tipo == "goal" and classe == "regular":
                stats.gols += 1
                assist = inc.get("assist1") or {}
                assist_id = assist.get("id")
                if assist_id:
                    if assist_id not in acumulado:
                        pos_a = self.buscar_posicao(assist_id)
                        if pos_a:
                            acumulado[assist_id] = {
                                "stats": StatsJogador(),
                                "posicao": pos_a,
                                "minuto_vermelho": None,
                            }
                    if assist_id in acumulado:
                        acumulado[assist_id]["stats"].assistencias += 1

            elif tipo == "goal" and classe == "ownGoal":
                stats.gols_contra += 1

            elif tipo == "card" and classe == "yellow":
                stats.amarelo += 1

            elif tipo == "card" and classe == "red":
                stats.vermelho += 1
                entry["minuto_vermelho"] = minuto

    def _aplicar_lineups(
        self,
        lineups_data: dict,
        home_team_id: int,
        away_team_id: int,
        home_gols: int,
        away_gols: int,
        acumulado: dict[int, dict],
    ) -> None:
        for side_key, team_id, gols_sofridos in (
            ("home", home_team_id, away_gols),
            ("away", away_team_id, home_gols),
        ):
            side = lineups_data.get(side_key) or {}
            for player in side.get("players") or []:
                pid = (player.get("player") or {}).get("id")
                if not pid:
                    continue
                minutos = self._extrair_minutos(player)
                if minutos <= 0:
                    continue

                pos = self.buscar_posicao(pid)
                if not pos:
                    continue

                if pid not in acumulado:
                    acumulado[pid] = {
                        "stats": StatsJogador(),
                        "posicao": pos,
                        "minuto_vermelho": None,
                    }

                stats: StatsJogador = acumulado[pid]["stats"]
                stats.minutos = max(stats.minutos, minutos)
                stats.gols_sofridos_selecao = max(stats.gols_sofridos_selecao, gols_sofridos)

                extra = self._extrair_stats_lineup(player)
                stats.passes_tentados += int(extra.get("passes_tentados", 0))
                stats.desarmes += int(extra.get("desarmes", 0))
                stats.cortes += int(extra.get("cortes", 0))
                stats.passes_decisivos += int(extra.get("passes_decisivos", 0))
                stats.perdas_bola += int(extra.get("perdas_bola", 0))
                if extra.get("passes_tentados", 0) > 0:
                    stats.precisao_passes = float(extra.get("precisao_passes", 0))

    def processar_evento(self, event_id: int, rodada: int) -> int:
        """Processa um jogo Sofascore. Retorna quantidade de jogadores pontuados."""
        evento = self._get_json(f"https://api.sofascore.com/api/v1/event/{event_id}")
        if not evento:
            return 0

        ev = evento.get("event") or {}
        home = ev.get("homeTeam") or {}
        away = ev.get("awayTeam") or {}
        home_id = home.get("id")
        away_id = away.get("id")
        home_score = int((ev.get("homeScore") or {}).get("current") or 0)
        away_score = int((ev.get("awayScore") or {}).get("current") or 0)

        if ev.get("status", {}).get("type") != "finished":
            print(f"⏳ Evento {event_id} ainda não finalizado.")
            return 0

        lineups = self._get_json(f"https://api.sofascore.com/api/v1/event/{event_id}/lineups")
        incidents = self._get_json(f"https://api.sofascore.com/api/v1/event/{event_id}/incidents")

        acumulado: dict[int, dict] = {}

        if lineups:
            self._aplicar_lineups(lineups, home_id, away_id, home_score, away_score, acumulado)

        if incidents:
            self._processar_incidentes(incidents.get("incidents") or [], acumulado)

        if not acumulado:
            print(f"📭 Nenhum jogador mapeado no evento {event_id}.")
            return 0

        for jogador_id, entry in acumulado.items():
            stats: StatsJogador = entry["stats"]
            posicao = entry["posicao"]
            pts_partida = calcular_pontos_partida(
                stats, posicao, entry.get("minuto_vermelho")
            )
            self._upsert_scout_rodada(jogador_id, rodada, stats, pts_partida)

        print(f"✅ Evento {event_id}: {len(acumulado)} jogador(es) processados.")
        return len(acumulado)

    def _upsert_scout_rodada(
        self,
        jogador_id: int,
        rodada: int,
        stats: StatsJogador,
        pts_partida: float,
    ) -> None:
        existente = (
            self.supabase.table("scouts_atleta_rodada")
            .select("*")
            .eq("jogador_id", jogador_id)
            .eq("rodada", rodada)
            .limit(1)
            .execute()
        )

        if existente.data:
            row = existente.data[0]
            merged = StatsJogador(
                minutos=row["minutos_jogados"] + stats.minutos,
                gols=row["gols"] + stats.gols,
                assistencias=row["assistencias"] + stats.assistencias,
                amarelo=row["cartao_amarelo"] + stats.amarelo,
                vermelho=row["cartao_vermelho"] + stats.vermelho,
                gols_contra=row["gols_contra"] + stats.gols_contra,
                gols_sofridos_selecao=max(
                    row["gols_sofridos_selecao"], stats.gols_sofridos_selecao
                ),
                passes_tentados=row["passes_tentados"] + stats.passes_tentados,
                precisao_passes=max(
                    float(row["precisao_passes"]), stats.precisao_passes
                ),
                desarmes=row["desarmes"] + stats.desarmes,
                cortes=row["cortes"] + stats.cortes,
                passes_decisivos=row["passes_decisivos"] + stats.passes_decisivos,
                perdas_bola=row["perdas_bola"] + stats.perdas_bola,
                defesas=row.get("defesas", 0) + stats.defesas,
                interceptacoes=row.get("interceptacoes", 0) + stats.interceptacoes,
                chutes_bloqueados=row.get("chutes_bloqueados", 0) + stats.chutes_bloqueados,
                duelos_vencidos=row.get("duelos_vencidos", 0) + stats.duelos_vencidos,
                duelos_tentados=row.get("duelos_tentados", 0) + stats.duelos_tentados,
                dribles_certos=row.get("dribles_certos", 0) + stats.dribles_certos,
                dribles_tentados=row.get("dribles_tentados", 0) + stats.dribles_tentados,
                bolas_longas_certas=row.get("bolas_longas_certas", 0) + stats.bolas_longas_certas,
                bolas_longas_tentadas=row.get("bolas_longas_tentadas", 0) + stats.bolas_longas_tentadas,
                faltas_sofridas=row.get("faltas_sofridas", 0) + stats.faltas_sofridas,
                impedimentos=row.get("impedimentos", 0) + stats.impedimentos,
                penalti_defendido=row.get("penalti_defendido", 0) + stats.penalti_defendido,
                penalti_perdido=row.get("penalti_perdido", 0) + stats.penalti_perdido,
            )
            pts_total = round(float(row["pontuacao_final_calculada"]) + pts_partida, 2)
            payload = {
                **self._stats_para_row(merged),
                "pontuacao_final_calculada": pts_total,
                "eventos_processados": row["eventos_processados"] + 1,
            }
            self.supabase.table("scouts_atleta_rodada").update(payload).eq(
                "id", row["id"]
            ).execute()
        else:
            payload = {
                "jogador_id": jogador_id,
                "rodada": rodada,
                **self._stats_para_row(stats),
                "pontuacao_final_calculada": pts_partida,
                "eventos_processados": 1,
            }
            self.supabase.table("scouts_atleta_rodada").insert(payload).execute()

    def _stats_para_row(self, stats: StatsJogador) -> dict[str, Any]:
        return {
            "minutos_jogados": stats.minutos,
            "gols": stats.gols,
            "assistencias": stats.assistencias,
            "cartao_amarelo": stats.amarelo,
            "cartao_vermelho": stats.vermelho,
            "gols_contra": stats.gols_contra,
            "saldo_gols": stats.gols_sofridos_selecao == 0 and stats.minutos >= 60,
            "gols_sofridos_selecao": stats.gols_sofridos_selecao,
            "passes_tentados": stats.passes_tentados,
            "precisao_passes": stats.precisao_passes,
            "desarmes": stats.desarmes,
            "cortes": stats.cortes,
            "passes_decisivos": stats.passes_decisivos,
            "perdas_bola": stats.perdas_bola,
            "defesas": stats.defesas,
            "interceptacoes": stats.interceptacoes,
            "chutes_bloqueados": stats.chutes_bloqueados,
            "duelos_vencidos": stats.duelos_vencidos,
            "duelos_tentados": stats.duelos_tentados,
            "dribles_certos": stats.dribles_certos,
            "dribles_tentados": stats.dribles_tentados,
            "bolas_longas_certas": stats.bolas_longas_certas,
            "bolas_longas_tentadas": stats.bolas_longas_tentadas,
            "faltas_sofridas": stats.faltas_sofridas,
            "impedimentos": stats.impedimentos,
            "penalti_defendido": stats.penalti_defendido,
            "penalti_perdido": stats.penalti_perdido,
        }

    def processar_jogos_da_rodada(self, rodada: int, forcar: bool = False) -> dict:
        """Processa todos os jogos de jogos_copa para a rodada.
        Retorna { total_jogadores, jogos_sucesso, jogos_falha }."""
        query = (
            self.supabase.table("jogos_copa")
            .select("id_sofascore, pontos_processados")
            .eq("rodada_numero", rodada)
        )
        res = query.execute()
        jogos = res.data or []
        total_jogadores = 0
        jogos_sucesso = 0
        jogos_falha = 0

        for jogo in jogos:
            if jogo.get("pontos_processados") and not forcar:
                jogos_sucesso += 1
                continue
            event_id = jogo["id_sofascore"]
            n = self.processar_evento(event_id, rodada)
            if n > 0:
                self.supabase.table("jogos_copa").update(
                    {
                        "pontos_processados": True,
                        "processado_em": datetime.now(timezone.utc).isoformat(),
                    }
                ).eq("id_sofascore", event_id).execute()
                total_jogadores += n
                jogos_sucesso += 1
            else:
                jogos_falha += 1
            time.sleep(1.2)

        print(f"\n📊 Rodada {rodada}: {jogos_sucesso} jogos OK, {jogos_falha} falhas, {total_jogadores} jogadores pontuados.")
        return {
            "total_jogadores": total_jogadores,
            "jogos_sucesso": jogos_sucesso,
            "jogos_falha": jogos_falha,
        }
