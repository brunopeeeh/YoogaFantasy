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

# Adicionando .. ao path para achar o .env que está na raiz
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

def inserir_jogos():
    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        print("⚠️ Variáveis VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas.")
        return

    try:
        supabase: Client = create_client(url, key)

        print("🔌 Buscando seleções no banco...")
        res_selecoes = supabase.table("selecoes").select("id, nome").execute()
        selecoes = res_selecoes.data

        mapa_selecoes = { s["nome"]: s["id"] for s in selecoes }

        print("📂 Lendo o JSON de jogos...")
        arquivo_json = os.path.join(os.path.dirname(__file__), "..", "jogos_fase_grupos_real.json")
        with open(arquivo_json, "r", encoding="utf-8") as f:
            jogos_json = json.load(f)

        payloads = []
        nao_encontrados = set()

        for jogo in jogos_json:
            time_casa = jogo.get("time_casa")
            time_fora = jogo.get("time_fora")

            # Especial para Argélia se estiver diferente
            if time_casa == "Algeria": time_casa = "Argélia"
            if time_fora == "Algeria": time_fora = "Argélia"

            id_casa = mapa_selecoes.get(time_casa)
            id_fora = mapa_selecoes.get(time_fora)

            if not id_casa:
                nao_encontrados.add(time_casa)
            if not id_fora:
                nao_encontrados.add(time_fora)

            if id_casa and id_fora:
                payloads.append({
                    "id_sofascore": jogo["id_sofascore"],
                    "rodada_numero": jogo["rodada_numero"],
                    "grupo_rodada": jogo["grupo_rodada"],
                    "time_casa_id": id_casa,
                    "time_fora_id": id_fora,
                    "timestamp_bruto": jogo["timestamp_bruto"],
                    "data_local_brt": jogo["data_local_brt"]
                })

        if nao_encontrados:
            print(f"⚠️ As seguintes seleções não foram encontradas no banco: {nao_encontrados}")
        
        if payloads:
            print(f"🚀 Inserindo {len(payloads)} jogos no Supabase...")
            res = supabase.table("jogos_copa").upsert(payloads, on_conflict="id_sofascore").execute()
            print("✅ Inserção concluída!")
        else:
            print("❌ Nenhum jogo válido para inserir.")

    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    inserir_jogos()
