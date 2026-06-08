import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class MercadoFantasy:
    def __init__(self):
        url = os.getenv("SUPABASE_URL").strip('"\'')
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY").strip('"\'')
        self.supabase: Client = create_client(url, key)

    def listar_atletas_mercado(self, pagina=0, limite=10, pesquisa_nome=None, posicao=None, selecao_id=None, ordem_preco="DESC"):
        """
        Puxa os jogadores do Supabase aplicando os filtros da tela de mercado.
        pagina: Número da página (começa em 0)
        limite: Quantidade de atletas por página (no seu print são 7 ou 8 por tela)
        pesquisa_nome: Texto digitado na barra de pesquisa
        posicao: Filtro de posição ('G', 'D', 'M', 'F')
        selecao_id: ID da seleção filtrada no dropdown
        ordem_preco: 'DESC' (mais caros primeiro) ou 'ASC' (mais baratos primeiro)
        """
        print(f"🔍 Filtrando mercado (Página {pagina})...")
        
        # Calculando o OFFSET para a paginação do banco de dados
        offset_inicial = pagina * limite
        offset_final = offset_inicial + limite - 1

        try:
            # Iniciamos a query trazendo os dados do jogador e os dados da tabela relacionada 'selecoes'
            # O Supabase resolve o JOIN automaticamente se usarmos a sintaxe abaixo:
            query = self.supabase.table("jogadores").select(
                "id_sofascore, nome_fantasia, nome_completo, posicao, preco, status_medico, foto_url, selecoes(nome, bandeira_url)"
            )

            # --- APLICAÇÃO DOS FILTROS DINÂMICOS ---
            
            # 1. Filtro por barra de pesquisa (Nome)
            if pesquisa_nome:
                # O 'ilike' busca partes do nome sem diferenciar maiúsculas/minúsculas
                query = query.ilike("nome_completo", f"%{pesquisa_nome}%")

            # 2. Filtro por Dropdown de Posição
            if posicao:
                query = query.eq("posicao", posicao)

            # 3. Filtro por Dropdown de Seleção
            if selecao_id:
                query = query.eq("selecao_id", selecao_id)

            # --- ORDENAÇÃO E PAGINAÇÃO ---
            # Ordena pelo preço (exatamente como a setinha azul do seu print)
            desc_order = (ordem_preco.upper() == "DESC")
            query = query.order("preco", desc=desc_order)

            # Aplica o limite da página (Garante que a resposta venha leve)
            query = query.range(offset_inicial, offset_final)

            response = query.execute()
            
            # Formata a resposta para entregar um JSON limpo e mastigado para o seu Front-end
            atletas_formatados = []
            for atleta in response.data:
                # Puxa os dados que vieram do relacionamento SQL
                dados_pais = atleta.get("selecoes", {}) or {}
                
                atletas_formatados.append({
                    "id": atleta["id_sofascore"],
                    "nome": atleta["nome_fantasia"],
                    "posicao": atleta["posicao"],
                    "preco": float(atleta["preco"]),
                    "status_medico": atleta["status_medico"],
                    "foto": atleta["foto_url"],
                    "selecao_nome": dados_pais.get("nome", "Desconhecido"),
                    "selecao_bandeira": dados_pais.get("bandeira_url", None)
                })

            return atletas_formatados

        except Exception as e:
            print(f"❌ Erro ao listar mercado: {e}")
            return []