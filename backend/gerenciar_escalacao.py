import os
from dotenv import load_dotenv
from supabase import create_client, Client
from backend.validacoes import ValidadorFantasy  # Importa o validador que criámos no outro arquivo

load_dotenv()

class GerenciadorEscalacao:
    def __init__(self):
        url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
        
        url = url.strip('"\'')
        key = key.strip('"\'')
        
        self.supabase: Client = create_client(url, key)
        self.validador = ValidadorFantasy()

    def criar_novo_time_usuario(self, uuid_usuario, nome_time):
        """
        Cria o registro inicial do time do utilizador com o orçamento de €100M.
        """
        print(f"🎮 Criando o time '{nome_time}' no banco de dados...")
        try:
            dados_time = {
                "usuario_id": uuid_usuario,
                "nome_time": nome_time,
                "banco_cartoletas": 100.00,
                "transferencias_gratis": 1
            }
            response = self.supabase.table("times_usuarios").insert(dados_time).execute()
            print("✅ Time criado com sucesso!")
            return response.data[0] # Retorna o ID do time criado
        except Exception as e:
            print(f"❌ Erro ao criar time: {e}")
            return None

    def salvar_elenco_15_jogadores(self, time_usuario_id, lista_jogadores_escolhidos, formacao="4-4-2"):
        """
        Aplica as validações de 15 jogadores e, se aprovado, salva no Supabase.
        """
        # 1. Executa a validação tática e financeira que está no arquivo validacoes.py
        sucesso, mensagens = self.validador.validar_elenco_completo(lista_jogadores_escolhidos, formacao)
        
        if not sucesso:
            print("🚨 Bloqueado! O elenco que tentou montar quebra as regras do Fantasy:")
            for erro in mensagens:
                print(f"   - {erro}")
            return False

        print(f"💾 Guardando elenco de 15 jogadores para o time ID {time_usuario_id}...")
        try:
            # Prepara a lista para a tabela pivot/associativa 'elencos_usuarios'
            dados_elenco = [
                {"time_usuario_id": time_usuario_id, "jogador_id": j["id_sofascore"]}
                for j in lista_jogadores_escolhidos
            ]
            
            # Limpa o elenco antigo se o utilizador estiver a refazer o time (caso use o token Reconstruir)
            self.supabase.table("elencos_usuarios").delete().eq("time_usuario_id", time_usuario_id).execute()
            
            # Insere o novo elenco
            self.supabase.table("elencos_usuarios").insert(dados_elenco).execute()
            print("🎉 Elenco de 15 jogadores salvo e validado com sucesso!")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao guardar o elenco no Supabase: {e}")
            return False

    def confirmar_escalacao_titular(self, time_usuario_id, rodada, lista_titulares, id_capitao, formacao):
        """
        Valida e salva a escalação dos 11 titulares baseando-se na formação escolhida (ex: '4-3-3').
        """
        # 1. Envia a formação para o validador atualizado
        sucesso, mensagens = self.validador.validar_onze_titular(lista_titulares, formacao)
        
        if not sucesso:
            print(f"🚨 Escalação Recusada para a Rodada {rodada}:")
            for erro in mensagens:
                print(f"   - {erro}")
            return False

        print(f" Stadium Salvando escalação no esquema {formacao} para a Rodada {rodada}...")
        try:
            dados_escalacao = []
            
            for j in lista_titulares:
                dados_escalacao.append({
                    "time_usuario_id": time_usuario_id,
                    "rodada": rodada,
                    "jogador_id": j["id_sofascore"],
                    "eh_titular": True,
                    "eh_capitao": (j["id_sofascore"] == id_capitao),
                    "formacao": formacao  # Salvando a formação escolhida no banco
                })

            # Executa o upsert no Supabase
            self.supabase.table("escalacoes_rodada").upsert(dados_escalacao).execute()
            print(f"🚀 Onze titular confirmado no esquema {formacao}!")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao confirmar escalação titular: {e}")
            return False