# CrisisConnect — Documentação

Plataforma inteligente que conecta empresas a voluntários em situações de crise, usando IBM Watson Orchestrate para matching por habilidades.

---

## Stack

- **Backend:** Express + TypeScript
- **Frontend:** Next.js + Tailwind CSS
- **Banco de dados:** PostgreSQL + Sequelize
- **IA:** IBM Watson Orchestrate
- **Túnel local:** ngrok

---

## Como rodar o projeto

### 1. Backend

Na pasta do backend, instale as dependências e inicie o servidor:

```bash
npm install
npm run dev
```

O servidor vai rodar em `http://localhost:3000`.

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```env
# ── IBM Watson Orchestrate ──────────────────────────────
WATSON_API_KEY=        # API Key da IBM Cloud (IAM)
WATSON_URL=            # URL base da instância (ex: https://api.au-syd.watson-orchestrate.cloud.ibm.com)
WATSON_REGION=         # Região da instância (ex: au-syd, us-south)
WATSON_PROJECT_ID=     # GUID da instância do Orchestrate (usado na URL das chamadas)
WATSON_AGENT_ID=       # GUID do agente criado dentro do Orchestrate

# ── Autenticação ────────────────────────────────────────
JWT_SECRET=            # String secreta para assinar os tokens JWT (use algo longo e aleatório)

# ── Banco de dados ──────────────────────────────────────
DB_NAME=               # Nome do banco PostgreSQL (ex: crisisconnect)
DB_USER=               # Usuário do PostgreSQL (ex: postgres)
DB_PASS=               # Senha do PostgreSQL
DB_HOST=               # Host do banco (ex: localhost)
```

**Como obter os valores do Watson:**
- `WATSON_API_KEY` → IBM Cloud → Manage → Access → API Keys
- `WATSON_URL` e `WATSON_REGION` → painel do Orchestrate → perfil → API details
- `WATSON_PROJECT_ID` → ID da instância que aparece na URL do Orchestrate
- `WATSON_AGENT_ID` → painel do Orchestrate → abra seu agente → GUID da URL

---

### 2. ngrok

Com o backend rodando, abra **outro terminal** e rode:

```bash
ngrok http 3000
```

A saída vai ser parecida com:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

> ⚠️ **Atenção:** No plano gratuito, a URL muda toda vez que o ngrok é reiniciado. Durante apresentações, **não feche o terminal do ngrok**.

---

### 3. Frontend

Na pasta do frontend, instale as dependências e inicie:

```bash
npm install
npm run dev
```

O frontend vai rodar em `http://localhost:3001`.

Crie um arquivo `.env.local` na raiz do frontend:

```env
# ── Backend ─────────────────────────────────────────────
NEXT_PUBLIC_API_URL=   # URL do backend Express (ex: http://localhost:3000)
                       # Em produção, troque pelo endereço do servidor deployado
```

---

## Ordem de inicialização

```
1. npm run dev        → backend em localhost:3000
2. ngrok http 3000    → URL pública gerada para o Watson
3. npm run dev        → frontend em localhost:3001
```

---

## Watson Orchestrate — configuração das tools

O Watson Orchestrate precisa conseguir chamar os endpoints do backend para buscar voluntários e enviar notificações. Em desenvolvimento isso é feito via ngrok.

### Como funciona

```
Watson Orchestrate → ngrok → localhost:3000/tools/...
```

### Atualizar o openapi.yaml

Toda vez que o ngrok for reiniciado, a URL pública muda. Atualize o campo `servers` no `openapi.yaml` e reimporte no painel do Orchestrate:

```yaml
servers:
  - url: https://abc123.ngrok-free.app  # ← cole sua URL do ngrok aqui
```

### Reimportar no Watson Orchestrate

1. Acesse [cloud.ibm.com](https://cloud.ibm.com) e entre no **watsonx Orchestrate**
2. Vá em **Skills and Apps** → **Add Skills** → **From a file**
3. Faça upload do `openapi.yaml` atualizado
4. Selecione as operações e publique as skills

---

## Em produção

Em produção o ngrok não é necessário — o backend terá uma URL pública permanente (ex: via Vercel, Railway, ou outro serviço).

Nesse caso, basta atualizar o `openapi.yaml` no painel do Watson Orchestrate com a URL do servidor de produção:

```yaml
servers:
  - url: https://seu-backend.vercel.app  # ← URL de produção
```

> Após atualizar, reimporte o `openapi.yaml` no painel do Orchestrate para que as tools passem a usar a nova URL.

---

## Setup do ngrok (primeira vez)

### Instalação (Windows)

```bash
winget install Ngrok.Ngrok
```

Se aparecer erro de versão desatualizada:

```bash
ngrok update
```

Ou baixe direto em [ngrok.com/download](https://ngrok.com/download).

### Autenticar

1. Crie uma conta gratuita em [ngrok.com](https://ngrok.com)
2. No dashboard, copie seu **authtoken**
3. Rode:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

---

## Troubleshooting

| Erro | Solução |
|------|---------|
| `authentication failed: agent version too old` | Rode `ngrok update` ou baixe a versão mais recente |
| URL mudou e o Orchestrate parou de funcionar | Reinicie o ngrok, atualize a URL no `openapi.yaml` e reimporte no Orchestrate |
| `There was no server found in the OpenAPI definition` | Adicione o campo `servers` com exatamente uma URL no `openapi.yaml` |
| Orchestrate não consegue chamar os endpoints | Verifique se o backend está rodando e se o ngrok está ativo |
| Erro de conexão com o banco | Verifique se o PostgreSQL está rodando e se as variáveis do `.env` estão corretas |