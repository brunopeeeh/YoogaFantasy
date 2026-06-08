import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class GestorTransacoes:
    def __init__(self):
        url = os.getenv("SUPABASE_URL").strip('"\'')
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY").strip('"\'')
        self.supabase: Client = create_client(url, key)

    def obter_saldo_usuario(self, time_usuario_id):
        """Busca o saldo atual de 'cartoletas' do time do utilizador."""
        res = self.supabase.table("times_usuarios").select("banco_cartoletas").eq("id", time_usuario_id).execute()
        if res.data:
            return float(res.data[0]["banco_cartoletas"])
        return 0.0

    def obter_preco_jogador(self, jogador_id):
        """Busca o preço atual de mercado do jogador."""
        res = self.supabase.table("jogadores").select("preco").eq("id_sofascore", jogador_id).execute()
        if res.data:
            return float(res.data[0]["preco"])
        return 0.0

    def comprar_jogador(self, time_usuario_id, jogador_id):
        """
        Executa a lógica de compra: verifica saldo, deduz o valor e adiciona ao elenco.
        """
        print(f"🛒 Tentando comprar jogador ID {jogador_id} para o time {time_usuario_id}...")
        
        # 1. Verificar se o jogador já está no elenco
        ja_escalado = self.supabase.table("elencos_usuarios")\
            .select("*").eq("time_usuario_id", time_usuario_id).eq("jogador_id", jogador_id).execute()
        
        if ja_escalado.data:
            print("⚠️ Erro: Este jogador já faz parte do teu elenco!")
            return False

        # 2. Verificar saldo e preço
        saldo_atual = self.obter_saldo_usuario(time_usuario_id)
        preco_jogador = self.obter_preco_jogador(jogador_id)

        if saldo_atual < preco_jogador:
            print(f"❌ Compra negada: Saldo insuficiente! Saldo: €{saldo_atual}M | Preço: €{preco_jogador}M")
            return False

        try:
            # 3. Deduzir saldo do utilizador
            novo_saldo = saldo_atual - preco_jogador
            self.supabase.table("times_usuarios").update({"banco_cartoletas": novo_saldo}).eq("id", time_usuario_id).execute()

            # 4. Inserir o jogador no elenco do utilizador
            self.supabase.table("elencos_usuarios").insert({
                "time_usuario_id": time_usuario_id,
                "jogador_id": jogador_id
            }).execute()

            print(f"✅ Compra realizada com sucesso! Novo saldo: €{novo_saldo}M")
            return True

        except Exception as e:
            print(f"❌ Erro crítico na transação de compra: {e}")
            return False

    def vender_jogador(self, time_usuario_id, jogador_id):
        """
        Executa a lógica de venda: remove do elenco e devolve o dinheiro ao banco do utilizador.
        """
        print(f"💰 Tentando vender jogador ID {jogador_id} do time {time_usuario_id}...")

        # 1. Verificar se o jogador realmente pertence ao elenco do utilizador
        no_elenco = self.supabase.table("elencos_usuarios")\
            .select("*").eq("time_usuario_id", time_usuario_id).eq("jogador_id", jogador_id).execute()
        
        if not no_elenco.data:
            print("⚠️ Erro: Este jogador não pertence ao teu elenco para poder ser vendido!")
            return False

        try:
            # 2. Obter preço do jogador e saldo atual do utilizador
            saldo_atual = self.obter_saldo_usuario(time_usuario_id)
            preco_jogador = self.obter_preco_jogador(jogador_id)
            novo_saldo = saldo_atual + preco_jogador

            # 3. Remover jogador do elenco
            self.supabase.table("elencos_usuarios")\
                .delete().eq("time_usuario_id", time_usuario_id).eq("jogador_id", jogador_id).execute()

            # 4. Devolver o dinheiro atualizado ao banco do utilizador
            self.supabase.table("times_usuarios").update({"banco_cartoletas": novo_saldo}).eq("id", time_usuario_id).execute()

            print(f"🤝 Venda concluída! Jogador removido e €{preco_jogador}M devolvidos. Novo saldo: €{novo_saldo}M")
            return True

        except Exception as e:
            print(f"❌ Erro crítico na transação de venda: {e}")
            return False