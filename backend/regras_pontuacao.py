"""
Regras de pontuação Yooga Fantasy (regras_fantasy.md).
Funções puras — sem I/O.
"""

from dataclasses import dataclass, field


@dataclass
class StatsJogador:
    minutos: int = 0
    gols: int = 0
    assistencias: int = 0
    amarelo: int = 0
    vermelho: int = 0
    gols_contra: int = 0
    gols_sofridos_selecao: int = 0
    passes_tentados: int = 0
    precisao_passes: float = 0.0
    desarmes: int = 0
    cortes: int = 0
    passes_decisivos: int = 0
    perdas_bola: int = 0


def _pontos_gol(posicao: str) -> float:
    if posicao in ("G", "D"):
        return 6.0
    if posicao == "M":
        return 5.0
    return 4.0


def _pontos_assistencia(posicao: str) -> float:
    if posicao in ("G", "D"):
        return 4.0
    return 3.0


def _pontos_vermelho(minuto: int) -> float:
    if minuto < 30:
        return -4.0
    if minuto < 60:
        return -3.0
    return -2.0


def calcular_pontos_partida(stats: StatsJogador, posicao: str, minuto_vermelho: int | None = None) -> float:
    """Pontuação de um jogador em uma partida."""
    if stats.minutos <= 0:
        return 0.0

    pts = 0.0

    if stats.minutos >= 60:
        pts += 2.0
    else:
        pts += 1.0

    pts += stats.gols * _pontos_gol(posicao)
    pts += stats.assistencias * _pontos_assistencia(posicao)
    pts += stats.amarelo * -1.0
    pts += stats.gols_contra * -2.0

    if stats.vermelho > 0:
        pts += _pontos_vermelho(minuto_vermelho if minuto_vermelho is not None else 45)

    if posicao in ("G", "D") and stats.minutos >= 60:
        if stats.gols_sofridos_selecao == 0:
            pts += 4.0
        pts += (stats.gols_sofridos_selecao // 2) * -1.0

    if stats.passes_tentados >= 40 and stats.precisao_passes > 90.0:
        pts += 1.0

    pts += stats.desarmes // 3
    pts += stats.cortes // 5
    pts += stats.passes_decisivos // 2
    pts -= stats.perdas_bola // 3

    return round(pts, 2)


def calcular_pontos_rodada(stats_rodada: StatsJogador, posicao: str) -> float:
    """Agrega stats de múltiplos jogos na mesma rodada."""
    return calcular_pontos_partida(stats_rodada, posicao)


def calcular_novo_preco(preco_atual: float, pontos_rodada: float) -> float:
    """Variação de preço pós-rodada conforme desempenho."""
    if pontos_rodada >= 10:
        delta = 0.6
    elif pontos_rodada >= 6:
        delta = 0.3
    elif pontos_rodada >= 3:
        delta = 0.1
    elif pontos_rodada <= -4:
        delta = -0.5
    elif pontos_rodada <= -1:
        delta = -0.2
    elif pontos_rodada < 1:
        delta = -0.1
    else:
        delta = 0.0

    novo = preco_atual + delta
    return round(max(3.5, min(15.0, novo)), 1)


def multiplicador_capitao(token_triplo: bool) -> float:
    return 3.0 if token_triplo else 2.0
