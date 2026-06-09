#!/usr/bin/env python3
"""
Seed inicial — Yooga Fantasy
Executa toda a carga de dados iniciais em sequência:
  1. Importa seleções e jogadores (de dados_0.json ~ dados_4.json)
  2. Importa jogos da Copa (de jogos_fase_grupos_real.json)
  3. Garante config_rodada com deadline válido
  4. Garante tokens para times existentes
  5. Relatório final de verificação

Uso:
  python seed_inicial.py
"""

import os
import sys
import json
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


def conectar() -> Client:
    url = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip("\"'")
    key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip("\"'")
    if not url or not key:
        print("Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env")
        sys.exit(1)
    return create_client(url, key)


def importar_jogadores(supabase: Client) -> tuple[int, int]:
    """Lê dados_0.json a dados_4.json e faz upsert em selecoes + jogadores."""
    todas_selecoes: dict[int, dict] = {}
    todos_jogadores: list[dict] = []

    for i in range(5):
        path = f"dados_{i}.json"
        if not os.path.exists(path):
            print(f"  ⚠️  {path} não encontrado — pulando")
            continue
        with open(path, "r", encoding="utf-8") as f:
            dados = json.load(f)
        for item in dados.get("players", []):
            fp = item.get("fantasyPlayer", {})
            player = fp.get("player", {})
            team = fp.get("team", {})
            id_jog = player.get("id")
            id_sel = team.get("id")
            if not id_jog or not id_sel:
                continue
            if id_sel not in todas_selecoes:
                nome = team.get("name", "")
                if nome == "Algeria":
                    nome = "Argélia"
                todas_selecoes[id_sel] = {
                    "id": id_sel,
                    "nome": nome,
                    "bandeira_url": f"https://api.sofascore.app/api/v1/team/{id_sel}/image",
                }
            todos_jogadores.append({
                "id_sofascore": id_jog,
                "nome_completo": player.get("name"),
                "nome_fantasia": player.get("shortName"),
                "posicao": player.get("position"),
                "preco": fp.get("price"),
                "selecao_id": id_sel,
                "status_medico": fp.get("missingPlayerData", {}).get("type", "disponivel"),
                "foto_url": f"https://api.sofascore.app/api/v1/player/{id_jog}/image",
            })

    selecoes = list(todas_selecoes.values())

    if selecoes:
        supabase.table("selecoes").upsert(selecoes).execute()
        print(f"  ✅ {len(selecoes)} seleções importadas")
    if todos_jogadores:
        supabase.table("jogadores").upsert(todos_jogadores).execute()
        print(f"  ✅ {len(todos_jogadores)} jogadores importados")
    return len(selecoes), len(todos_jogadores)


def importar_jogos(supabase: Client) -> int:
    """Lê jogos_fase_grupos_real.json e faz upsert em jogos_copa."""
    path = "jogos_fase_grupos_real.json"
    if not os.path.exists(path):
        print("  ⚠️  jogos_fase_grupos_real.json não encontrado — pulando")
        return 0

    res = supabase.table("selecoes").select("id, nome").execute()
    mapa = {s["nome"]: s["id"] for s in res.data}

    with open(path, "r", encoding="utf-8") as f:
        jogos = json.load(f)

    payload = []
    pendentes = set()
    for j in jogos:
        casa = j.get("time_casa", "").replace("Algeria", "Argélia")
        fora = j.get("time_fora", "").replace("Algeria", "Argélia")
        id_casa = mapa.get(casa)
        id_fora = mapa.get(fora)
        if not id_casa:
            pendentes.add(casa)
        if not id_fora:
            pendentes.add(fora)
        if id_casa and id_fora:
            payload.append({
                "id_sofascore": j["id_sofascore"],
                "rodada_numero": j["rodada_numero"],
                "grupo_rodada": j["grupo_rodada"],
                "time_casa_id": id_casa,
                "time_fora_id": id_fora,
                "timestamp_bruto": j.get("timestamp_bruto"),
                "data_local_brt": j.get("data_local_brt"),
            })

    if pendentes:
        print(f"  ⚠️  Seleções não encontradas no banco: {pendentes}")
    if payload:
        supabase.table("jogos_copa").upsert(payload, on_conflict="id_sofascore").execute()
        print(f"  ✅ {len(payload)} jogos importados")
    return len(payload)


def seed_config_rodada(supabase: Client) -> None:
    """Garante config_rodada com deadline futuro (7 dias)."""
    existente = supabase.table("config_rodada").select("*").eq("id", 1).maybe_single().execute()
    if existente.data:
        deadline_atual = existente.data.get("deadline")
        if deadline_atual:
            dt = datetime.fromisoformat(deadline_atual.replace("Z", "+00:00"))
            if dt > datetime.now(timezone.utc):
                print(f"  ✅ config_rodada ok — deadline {dt.strftime('%d/%m %H:%M')}")
                return
    novo_deadline = datetime.now(timezone.utc) + timedelta(days=7)
    supabase.table("config_rodada").upsert({
        "id": 1,
        "rodada_atual": 1,
        "mercado_aberto": True,
        "deadline": novo_deadline.isoformat(),
    }).execute()
    print(f"  ✅ config_rodada criada/atualizada — deadline {novo_deadline.strftime('%d/%m %H:%M')}")


def seed_tokens(supabase: Client) -> None:
    """Garante tokens para times que ainda não têm."""
    times = supabase.table("times_usuarios").select("id").execute().data
    if not times:
        print("  ⏭️  Nenhum time para seed de tokens")
        return

    count = 0
    for t in times:
        tid = t["id"]
        existentes = supabase.table("tokens_usuario").select("tipo").eq("time_usuario_id", tid).execute().data
        tipos_existentes = {e["tipo"] for e in existentes}
        novos = []
        if "capitao_triplo" not in tipos_existentes:
            novos.append({"time_usuario_id": tid, "tipo": "capitao_triplo"})
        if "ajuste_rapido" not in tipos_existentes:
            novos.append({"time_usuario_id": tid, "tipo": "ajuste_rapido"})
        qtd_reconstruir = sum(1 for e in existentes if e["tipo"] == "reconstruir")
        for _ in range(2 - qtd_reconstruir):
            novos.append({"time_usuario_id": tid, "tipo": "reconstruir"})
        if novos:
            supabase.table("tokens_usuario").insert(novos).execute()
            count += len(novos)
    if count:
        print(f"  ✅ {count} tokens inseridos")
    else:
        print("  ✅ Todos os times já têm tokens")


def verificar(supabase: Client) -> None:
    """Relatório final."""
    print("\n" + "=" * 50)
    print("  RELATÓRIO DE VERIFICAÇÃO")
    print("=" * 50)

    tables = {
        "selecoes": "Seleções",
        "jogadores": "Jogadores",
        "jogos_copa": "Jogos",
        "config_rodada": "Config Rodada",
        "tokens_usuario": "Tokens",
    }
    ok = True
    for tbl, label in tables.items():
        try:
            res = supabase.table(tbl).select("*", count="exact").limit(0).execute()
            n = res.count if hasattr(res, "count") else len(res.data)
            print(f"  {'✅' if n else '⚠️'}  {label}: {n} registro(s)")
            if not n:
                ok = False
        except Exception as e:
            print(f"  ❌ {label}: erro — {e}")
            ok = False

    if ok:
        print("\n  ✅ Tudo pronto! O sistema está populado.")
    else:
        print("\n  ⚠️  Algumas tabelas vazias — verifique acima.")
    print("=" * 50)


def main() -> None:
    print("\n" + "=" * 50)
    print("  SEED INICIAL — YOOGA FANTASY")
    print("=" * 50)

    supabase = conectar()
    print("\n📦 Conectado ao Supabase\n")

    print("1️⃣  Importando seleções e jogadores...")
    n_sel, n_jog = importar_jogadores(supabase)

    print("\n2️⃣  Importando jogos...")
    n_jogos = importar_jogos(supabase)

    print("\n3️⃣  Verificando config_rodada...")
    seed_config_rodada(supabase)

    print("\n4️⃣  Verificando tokens...")
    seed_tokens(supabase)

    print("\n5️⃣  Verificando integridade...")
    verificar(supabase)

    print(f"\n🏁 Seed concluído ({n_sel} seleções, {n_jog} jogadores, {n_jogos} jogos)")


if __name__ == "__main__":
    main()
