FORMACOES = {
    "3-4-3": {"D": 3, "M": 4, "F": 3},
    "3-5-2": {"D": 3, "M": 5, "F": 2},
    "4-3-3": {"D": 4, "M": 3, "F": 3},
    "4-4-2": {"D": 4, "M": 4, "F": 2},
    "4-5-1": {"D": 4, "M": 5, "F": 1},
    "5-3-2": {"D": 5, "M": 3, "F": 2},
    "5-4-1": {"D": 5, "M": 4, "F": 1},
}

def get_limites_formacao(formacao):
    f = FORMACOES.get(formacao, FORMACOES["4-4-2"])
    return {"G": 2, "D": f["D"] + 1, "M": f["M"] + 1, "F": f["F"] + 1}

class ValidadorFantasy:
    def __init__(self, orçamento_maximo=150.0, max_por_selecao=3):
        self.orçamento_maximo = orçamento_maximo
        self.max_por_selecao = max_por_selecao

    def validar_elenco_completo(self, jogadores_selecionados, formacao="4-4-2"):
        """
        Valida o elenco de 15 jogadores escolhidos pelo utilizador.
        jogadores_selecionados: Lista de dicionários com os dados dos 15 jogadores.
        formacao: String no formato 'D-M-F' (ex: '4-4-2')
        """
        erros = []
        
        # 1. Validação de Tamanho do Elenco
        if len(jogadores_selecionados) != 15:
            erros.append(f"O elenco deve ter exatamente 15 jogadores. Atualmente tem {len(jogadores_selecionados)}.")
            return False, erros

        custo_total = 0.0
        posicoes = {"G": 0, "D": 0, "M": 0, "F": 0}
        contagem_selecoes = {}

        for atleta in jogadores_selecionados:
            custo_total += float(atleta.get("preco", 0))
            
            # Contagem de posições
            pos = atleta.get("posicao")
            if pos in posicoes:
                posicoes[pos] += 1
                
            # Contagem por seleção
            sel = atleta.get("selecao_id")
            contagem_selecoes[sel] = contagem_selecoes.get(sel, 0) + 1

        # 2. Validação de Orçamento
        if custo_total > self.orçamento_maximo:
            erros.append(f"Orçamento estourado! Custo total: R${custo_total}M. Máximo permitido: R${self.orçamento_maximo}M.")

        # 3. Validação de Posições no Elenco (limites dinâmicos por formação)
        limites = get_limites_formacao(formacao)
        if posicoes["G"] > limites["G"]:
            erros.append(f"Limite de {limites['G']} Goleiros excedido (encontrados: {posicoes['G']}).")
        if posicoes["D"] > limites["D"]:
            erros.append(f"Para a formação {formacao}, limite de {limites['D']} Defensores excedido (encontrados: {posicoes['D']}).")
        if posicoes["M"] > limites["M"]:
            erros.append(f"Para a formação {formacao}, limite de {limites['M']} Meio-campistas excedido (encontrados: {posicoes['M']}).")
        if posicoes["F"] > limites["F"]:
            erros.append(f"Para a formação {formacao}, limite de {limites['F']} Atacantes excedido (encontrados: {posicoes['F']}).")

        # 4. Validação de Limite por Seleção (Máximo 3 jogadores do mesmo país)
        for sel_id, qtd in contagem_selecoes.items():
            if qtd > self.max_por_selecao:
                erros.append(f"Excesso de jogadores da mesma seleção (ID: {sel_id}). Máximo permitido: {self.max_por_selecao}. Selecionados: {qtd}.")

        if erros:
            return False, erros
        return True, ["Elenco validado com sucesso!"]

    def validar_onze_titular(self, titulares, formacao_escolhida):
        """
        Valida a escalação dos 11 titulares com base em uma formação específica (ex: '4-3-3', '3-5-2').
        titulares: Lista de jogadores escalados.
        formacao_escolhida: String no formato 'D-M-F' (ex: '4-4-2')
        """
        erros = []

        if len(titulares) != 11:
            erros.append(f"O time titular deve ter exatamente 11 jogadores. Selecionados: {len(titulares)}.")
            return False, erros

        # Destrincha a formação (ex: '4-3-3' vira defensores=4, meias=3, atacantes=3)
        try:
            pecas_taticas = [int(x) for x in formacao_escolhida.split("-")]
            if len(pecas_taticas) != 3 or sum(pecas_taticas) != 10:
                raise ValueError
            
            defensores_esperados = pecas_taticas[0]
            meias_esperados = pecas_taticas[1]
            atacantes_esperados = pecas_taticas[2]
        except (ValueError, IndexError):
            erros.append(f"Formação tática inválida ou não suportada: '{formacao_escolhida}'. Use padrões como '4-4-2', '4-3-3', '3-5-2'.")
            return False, erros

        # Contagem real dos jogadores escalados pelo usuário
        posicoes = {"G": 0, "D": 0, "M": 0, "F": 0}
        for atleta in titulares:
            pos = atleta.get("posicao")
            if pos in posicoes:
                posicoes[pos] += 1

        # --- VALIDAÇÕES RÍGIDAS DA FORMAÇÃO ---
        # 1. Todo esquema tático exige exatamente 1 goleiro
        if posicoes["G"] != 1:
            erros.append(f"Seu time precisa de exatamente 1 Goleiro. Escalados: {posicoes['G']}.")
        
        # 2. Valida os Defensores (D)
        if posicoes["D"] != defensores_esperados:
            erros.append(f"Para a formação {formacao_escolhida}, você precisa de {defensores_esperados} Defensores. Escalados: {posicoes['D']}.")
            
        # 3. Valida os Meio-campistas (M)
        if posicoes["M"] != meias_esperados:
            erros.append(f"Para a formação {formacao_escolhida}, você precisa de {meias_esperados} Meio-campistas. Escalados: {posicoes['M']}.")
            
        # 4. Valida os Atacantes (F)
        if posicoes["F"] != atacantes_esperados:
            erros.append(f"Para a formação {formacao_escolhida}, você precisa de {atacantes_esperados} Atacantes. Escalados: {posicoes['F']}.")

        if erros:
            return False, erros
        return True, [f"Formação {formacao_escolhida} validada com sucesso!"]