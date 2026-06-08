from curl_cffi import requests
from datetime import datetime
import json
import pytz

def puxar_jogos_copa():
    tournament_id = 16
    season_id = 58210
    
    # Lista que armazenará todos os 72 confrontos processados
    jogos_fase_de_grupos = []
    
    headers = {
        "Accept": "*/*",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.sofascore.com/",
        "Origin": "https://www.sofascore.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
    
    print("📡 Conectando à API do Sofascore via Personificação TLS (Chrome 120)...")
    
    # Fuso horário oficial para o fechamento do mercado e cronograma (Brasília)
    fuso_br = pytz.timezone('America/Sao_Paulo')
    
    # Varre individualmente as 3 rodadas regulamentares da Fase de Grupos
    for rodada in [1, 2, 3]:
        url = f"https://api.sofascore.com/api/v1/unique-tournament/{tournament_id}/season/{season_id}/events/round/{rodada}"
        
        try:
            response = requests.get(url, headers=headers, impersonate="chrome120")
            
            if response.status_code == 200:
                dados = response.json()
                partidas = dados.get("events", [])
                
                for partida in partidas:
                    status_rodada = partida.get("roundInfo", {})
                    nome_rodada = status_rodada.get("name", f"Rodada {rodada}")
                    
                    # Extração do Timestamp Unix enviado pelo servidor
                    timestamp_bruto = partida.get("startTimestamp")
                    data_formatada = "Data indisponível"
                    
                    # Converte o timestamp para objeto datetime ciente do fuso horário UTC e transforma em BRT
                    if timestamp_bruto:
                        utc_dt = datetime.fromtimestamp(timestamp_bruto, tz=pytz.utc)
                        data_local = utc_dt.astimezone(fuso_br)
                        data_formatada = data_local.strftime("%d/%m/%Y %H:%M")
                    
                    jogos_fase_de_grupos.append({
                        "id_sofascore": partida.get("id"),
                        "rodada_numero": rodada,
                        "grupo_rodada": nome_rodada,
                        "time_casa": partida.get("homeTeam", {}).get("name"),
                        "time_fora": partida.get("awayTeam", {}).get("name"),
                        "timestamp_bruto": timestamp_bruto,
                        "data_local_brt": data_formatada
                    })
                print(f"  -> ⚽ Rodada {rodada} processada. ({len(partidas)} partidas encontradas)")
            else:
                print(f"  -> ⚠️ Falha ao ler Rodada {rodada}: Código {response.status_code}")
                
        except Exception as e:
            print(f"  -> ❌ Erro inesperado na requisição da rodada {rodada}: {str(e)}")

    # Se coletamos os dados com sucesso, persistimos o arquivo local para checagem
    if jogos_fase_de_grupos:
        # Ordena os jogos cronologicamente por data para facilitar a leitura visual
        jogos_fase_de_grupos.sort(key=lambda x: x["timestamp_bruto"] if x["timestamp_bruto"] else 0)
        
        print(f"\n✅ Concluído! Total de {len(jogos_fase_de_grupos)} jogos da 1ª Fase extraídos.")
        
        arquivo_saida = "jogos_fase_grupos_real.json"
        with open(arquivo_saida, "w", encoding="utf-8") as f:
            json.dump(jogos_fase_de_grupos, f, indent=4, ensure_ascii=False)
            
        print(f"💾 Os dados foram limpos e salvos com sucesso em '{arquivo_saida}'")
    else:
        print("\n❌ Nenhuma partida pôde ser extraída do endpoint.")

if __name__ == "__main__":
    puxar_jogos_copa()