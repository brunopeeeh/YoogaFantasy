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
    vermelho_2o_amarelo: bool = False
    gols_contra: int = 0
    gols_sofridos_selecao: int = 0
    passes_tentados: int = 0
    precisao_passes: float = 0.0
    desarmes: int = 0
    cortes: int = 0
    passes_decisivos: int = 0
    perdas_bola: int = 0
    defesas: int = 0
    interceptacoes: int = 0
    chutes_bloqueados: int = 0
    duelos_vencidos: int = 0
    duelos_tentados: int = 0
    dribles_certos: int = 0
    dribles_tentados: int = 0
    bolas_longas_certas: int = 0
    bolas_longas_tentadas: int = 0
    faltas_sofridas: int = 0
    impedimentos: int = 0
    penalti_defendido: int = 0
    penalti_perdido: int = 0


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


def _pontos_vermelho(minuto: int, segundo_amarelo: bool = False) -> float:
    base = -3.0 if segundo_amarelo else -4.0
    if minuto < 30:
        return base
    if minuto < 60:
        return base + 1.0
    return base + 2.0


def calcular_pontos_partida(stats: StatsJogador, posicao: str, minuto_vermelho: int | None = None) -> float:
    """Pontuação de um jogador em uma partida."""
    if stats.minutos <= 0:
        return 0.0

    pts = 0.0

    # Participação
    if stats.minutos >= 60:
        pts += 2.0
    else:
        pts += 1.0

    # Gol
    pts += stats.gols * _pontos_gol(posicao)

    # Assistência
    pts += stats.assistencias * _pontos_assistencia(posicao)

    # Gol contra
    pts += stats.gols_contra * -2.0

    # Cartão amarelo
    pts += stats.amarelo * -1.0

    # Cartão vermelho
    if stats.vermelho > 0:
        pts += _pontos_vermelho(
            minuto_vermelho if minuto_vermelho is not None else 45,
            stats.vermelho_2o_amarelo,
        )

    # Clean sheet (G/D)
    if posicao in ("G", "D") and stats.minutos >= 60:
        if stats.gols_sofridos_selecao == 0:
            pts += 4.0
        pts += (stats.gols_sofridos_selecao // 2) * -1.0

    # Precisão de passes
    if stats.passes_tentados >= 40 and stats.precisao_passes >= 90.0:
        pts += 1.0

    # Desarmes, cortes, passes decisivos, perdas
    pts += stats.desarmes // 3
    pts += stats.cortes // 5
    pts += stats.passes_decisivos // 2
    pts -= stats.perdas_bola // 3

    # Defesas (goleiros)
    if posicao == "G":
        pts += stats.defesas // 2

    # Interceptações
    pts += stats.interceptacoes // 3

    # Chutes bloqueados
    pts += stats.chutes_bloqueados // 2

    # Duelos vencidos
    if stats.duelos_vencidos >= 3 and stats.duelos_vencidos / max(stats.duelos_tentados, 1) >= 0.5:
        pts += 1.0

    # Dribles certos
    if stats.dribles_certos >= 3 and stats.dribles_certos / max(stats.dribles_tentados, 1) >= 0.6:
        pts += 1.0

    # Bolas longas
    if stats.bolas_longas_certas >= 3 and stats.bolas_longas_certas / max(stats.bolas_longas_tentadas, 1) >= 0.6:
        pts += 1.0

    # Faltas sofridas
    pts += stats.faltas_sofridas // 3

    # Impedimentos
    pts -= stats.impedimentos // 2

    # Pênalti defendido (goleiros)
    pts += stats.penalti_defendido * 5.0

    # Pênalti perdido
    pts += stats.penalti_perdido * -3.0

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
