"""
Integração Sofascore — delega para EnginePontuacao.
Mantido para compatibilidade com execução direta.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.processar_pontuacao import EnginePontuacao


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--rodada", type=int, required=True)
    parser.add_argument("--forcar", action="store_true")
    args = parser.parse_args()

    engine = EnginePontuacao()
    total = engine.processar_jogos_da_rodada(args.rodada, forcar=args.forcar)
    print(f"Total: {total} jogador(es) processados.")


if __name__ == "__main__":
    main()
