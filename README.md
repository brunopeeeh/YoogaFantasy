# Yooga Fantasy

Fantasy game da Copa do Mundo — monte seu elenco de 15 jogadores, faça transferências, use tokens especiais e dispute ligas privadas com amigos.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend / dados:** Supabase (Auth, Postgres, RPC)
- **Scripts Python:** importação de jogadores, pontuação Sofascore (pasta `backend/`)

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Python 3.10+ (opcional, para scripts de dados)

## Configuração

1. Clone o repositório e instale dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variáveis no `.env` (veja `.env.example`).

4. Aplique as migrations no Supabase (SQL Editor ou CLI):

```bash
supabase db push
```

Ou execute manualmente os arquivos em `supabase/migrations/` na ordem numérica.

5. Importe jogadores (opcional, se o banco estiver vazio):

```bash
cd backend
pip install python-dotenv supabase
python main.py
```

6. Inicie o app:

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon/public do Supabase |

Para scripts Python (`backend/`):

| Variável | Descrição |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (nunca expor no frontend) |

## Migrations

As migrations em `supabase/migrations/` cobrem:

- Capitão, RLS, RPC `salvar_elenco`
- Config de rodada e mercado fechado
- Tokens especiais (`capitao_triplo`, `ajuste_rapido`, `reconstruir`)
- Ligas privadas, perfis de usuário e leaderboard
- Jogos da Copa (calendário FDR)

> **Nota:** As tabelas base (`jogadores`, `selecoes`, `times_usuarios`, `elencos_usuarios`) devem existir no projeto Supabase antes das migrations incrementais.

## Funcionalidades

- Login via magic link (e-mail)
- Mercado com filtros, paginação e drag-and-drop
- Elenco 2-5-5-3, orçamento €100M, máx. 3 por seleção
- Capitão, transferências grátis e penalidade por extras
- Tokens especiais (Capitão Triplo, Ajuste Rápido, Reconstruir)
- Banner de mercado fechado com deadline dinâmico
- Ligas privadas com código de convite e ranking

## Ciclo de rodadas (backend)

Após aplicar as migrations `20260608000011` e `20260608000012`:

```bash
cd backend
pip install -r requirements.txt
```

### Comandos

| Comando | Descrição |
|---------|-----------|
| `python -m backend.fechar_rodada --rodada 1` | Ciclo completo da rodada 1 |
| `python -m backend.fechar_rodada --fechar-mercado` | Só fecha mercado + snapshot |
| `python -m backend.fechar_rodada --apenas-pontos --rodada 1` | Processa jogos + pontuação |
| `python -m backend.fechar_rodada --abrir-proxima --deadline "2026-06-20T16:00:00+00:00"` | Abre próxima rodada |
| `python -m backend.integracao_sofascore --rodada 1` | Só processa scouts Sofascore |

### Fluxo automático (`fechar_rodada`)

1. Fecha mercado e congela elencos (`elenco_snapshot_rodada`)
2. Processa jogos de `jogos_copa` via API Sofascore → `scouts_atleta_rodada`
3. Calcula pontos dos 15 jogadores + capitão (×2 ou ×3) − penalidade de transferências
4. Sincroniza `usuarios_ligas.pontos_acumulados`
5. Atualiza preços dos jogadores
6. Reverte elenco do token **Ajuste Rápido**
7. Abre próxima rodada (+1 transferência grátis, máx. 2)

### Agendamento

Configure um cron (GitHub Actions, Supabase Edge Function ou servidor) para rodar após os jogos da rodada:

```bash
python -m backend.fechar_rodada --rodada N --deadline "ISO-DATE"
```

Para atualizar `mercado_aberto` automaticamente pelo deadline, agende também:

```sql
SELECT public.atualizar_mercado_aberto();
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |

## Deploy

Build estático compatível com Vercel, Netlify ou qualquer host de SPA:

```bash
npm run build
```

Configure as variáveis `VITE_SUPABASE_*` no painel do provedor.

## Regras do jogo

Consulte [`regras_fantasy.md`](regras_fantasy.md) para o manual completo de pontuação e mecânicas.
# YoogaFantasy
