import os
import sys
import json
from dotenv import load_dotenv
from supabase import create_client, Client

# Configura o terminal para UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

load_dotenv()


def processar_todos_os_arquivos_locais():
    lista_jogadores = []
    dicionario_selecoes = {}

    print("📂 Iniciando o processamento dos arquivos JSON locais...")

    # Roda o loop de 0 a 4 para ler os 5 arquivos salvos
    for i in range(5):
        nome_arquivo = f"dados_{i}.json"
        print(f"🔄 Lendo o arquivo {nome_arquivo}...")

        if not os.path.exists(nome_arquivo):
            print(f"⚠️ Aviso: Arquivo {nome_arquivo} não encontrado. Pulando...")
            continue

        with open(nome_arquivo, "r", encoding="utf-8") as f:
            dados = json.load(f)

        jogadores_da_pagina = dados.get("players", [])

        for item in jogadores_da_pagina:
            f_player = item.get("fantasyPlayer", {})
            player_info = f_player.get("player", {})
            team_info = f_player.get("team", {})

            id_jogador = player_info.get("id")
            id_selecao = team_info.get("id")

            if not id_jogador or not id_selecao:
                continue

            url_foto = f"https://api.sofascore.app/api/v1/player/{id_jogador}/image"
            url_bandeira = f"https://api.sofascore.app/api/v1/team/{id_selecao}/image"

            if id_selecao not in dicionario_selecoes:
                nome_selecao = team_info.get("name")
                if nome_selecao == "Algeria":
                    nome_selecao = "Argélia"
                dicionario_selecoes[id_selecao] = {
                    "id": id_selecao,
                    "nome": nome_selecao,
                    "bandeira_url": url_bandeira,
                }

            jogador_estruturado = {
                "id_sofascore": id_jogador,
                "nome_completo": player_info.get("name"),
                "nome_fantasia": player_info.get("shortName"),
                "posicao": player_info.get("position"),
                "preco": f_player.get("price"),
                "selecao_id": id_selecao,
                "status_medico": f_player.get("missingPlayerData", {}).get(
                    "type", "disponivel"
                ),
                "foto_url": url_foto,
            }
            lista_jogadores.append(jogador_estruturado)

    # CORREÇÃO AQUI: Alinhados totalmente à esquerda para rodar APÓS o fim do loop 'for i in range(5)'
    lista_selecoes = list(dicionario_selecoes.values())
    print(f"\n📊 Processamento concluído!")
    print(f"Total de seleções mapeadas: {len(lista_selecoes)}")
    print(f"Total de jogadores mapeados: {len(lista_jogadores)}")

    return lista_jogadores, lista_selecoes


def salvar_no_supabase(jogadores, selecoes):
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
    key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
    )

    if not url or not key:
        print("⚠️ Variáveis SUPABASE_URL ou SUPABASE_KEY não encontradas no arquivo .env.")
        return

    try:
        url = url.strip('"\'')
        key = key.strip('"\'')
        supabase: Client = create_client(url, key)

        print("\n🔌 Conectando ao Supabase...")

        print("🏳️ Enviando seleções para o banco de dados...")
        supabase.table("selecoes").upsert(selecoes).execute()

        print("🏃 Enviando lista completa de jogadores para o banco de dados...")
        supabase.table("jogadores").upsert(jogadores).execute()

        print("🚀 Sucesso! A base completa de jogadores da Copa está salva no seu Supabase!")

    except Exception as e:
        print(f"❌ Erro ao salvar no Supabase: {e}")


# --- EXECUÇÃO ---
jogadores_completos, selecoes_completas = processar_todos_os_arquivos_locais()

if jogadores_completos:
    salvar_no_supabase(jogadores_completos, selecoes_completas)