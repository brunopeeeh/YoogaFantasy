#!/usr/bin/env python3
"""
Orquestrador do ciclo de rodada Yooga Fantasy.

Uso:
  python -m backend.fechar_rodada --rodada 1
  python -m backend.fechar_rodada --rodada 1 --apenas-pontos
  python -m backend.fechar_rodada --fechar-mercado
  python -m backend.fechar_rodada --abrir-proxima --deadline "2026-06-15T16:00:00+00:00"

Fluxo completo (--rodada N):
  1. Fecha mercado + snapshot dos elencos
  2. Processa jogos Sofascore da rodada (jogos_copa)
  3. Calcula pontuação dos usuários
  4. Sincroniza pontos nas ligas
  5. Atualiza preços dos jogadores
  6. Abre próxima rodada
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.atualizar_mercado import GerenciadorMercado
from backend.gerenciar_ranking import GerenciadorRanking
from backend.processar_pontuacao import EnginePontuacao


def obter_rodada_atual(supabase) -> int:
    res = supabase.table("config_rodada").select("rodada_atual").eq("id", 1).single().execute()
    return int(res.data["rodada_atual"])


def executar_ciclo_completo(rodada: int, forcar_jogos: bool = False, abrir_proxima: bool = True, deadline: str | None = None) -> None:
    mercado = GerenciadorMercado()
    ranking = GerenciadorRanking()
    engine = EnginePontuacao()

    print("\n" + "=" * 60)
    print(f"  CICLO DE RODADA — Rodada {rodada}")
    print("=" * 60 + "\n")

    print("▶ Passo 1/7 — Fechar mercado e congelar elencos")
    mercado.fechar_mercado()

    print("\n▶ Passo 2/7 — Processar jogos Sofascore")
    n_jogadores = engine.processar_jogos_da_rodada(rodada, forcar=forcar_jogos)
    print(f"   {n_jogadores} registros de jogadores processados.")

    print("\n▶ Passo 3/7 — Calcular pontuação dos times")
    ranking.fechar_rodada_fantasy(rodada)

    print("\n▶ Passo 4/7 — Sincronizar ligas")
    ranking.sincronizar_ligas(rodada)

    print("\n▶ Passo 5/6 — Atualizar preços")
    mercado.atualizar_precos_jogadores(rodada)

    if abrir_proxima:
        print("\n▶ Passo 6/6 — Abrir próxima rodada")
        mercado.abrir_proxima_rodada(deadline)
    else:
        print("\n▶ Passo 7/7 — Pulado (mercado permanece fechado)")

    print("\n🏁 Ciclo concluído.\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ciclo de rodada Yooga Fantasy")
    parser.add_argument("--rodada", type=int, help="Número da rodada a processar")
    parser.add_argument("--forcar", action="store_true", help="Reprocessar jogos já pontuados")
    parser.add_argument("--sem-abrir", action="store_true", help="Não abrir próxima rodada ao final")
    parser.add_argument("--deadline", type=str, help="Deadline ISO da próxima rodada")
    parser.add_argument("--fechar-mercado", action="store_true", help="Apenas fecha mercado + snapshot")
    parser.add_argument("--apenas-pontos", action="store_true", help="Só processa jogos + pontuação (mercado já fechado)")
    parser.add_argument("--abrir-proxima", action="store_true", help="Apenas abre próxima rodada")
    args = parser.parse_args()

    mercado = GerenciadorMercado()
    ranking = GerenciadorRanking()
    engine = EnginePontuacao()

    if args.fechar_mercado:
        mercado.fechar_mercado()
        return

    if args.abrir_proxima:
        mercado.abrir_proxima_rodada(args.deadline)
        return

    rodada = args.rodada
    if rodada is None:
        from backend.processar_pontuacao import EnginePontuacao as EP
        rodada = obter_rodada_atual(EP().supabase)

    if args.apenas_pontos:
        engine.processar_jogos_da_rodada(rodada, forcar=args.forcar)
        ranking.fechar_rodada_fantasy(rodada)
        ranking.sincronizar_ligas(rodada)
        mercado.atualizar_precos_jogadores(rodada)
        return

    executar_ciclo_completo(
        rodada,
        forcar_jogos=args.forcar,
        abrir_proxima=not args.sem_abrir,
        deadline=args.deadline,
    )


if __name__ == "__main__":
    main()
