# CrisisLink — Frontend

Frontend Next.js 15 + Tailwind para o sistema de voluntários em crise.

## Estrutura

```
src/
├── app/
│   ├── page.tsx                    → Landing page
│   ├── auth/
│   │   ├── login/page.tsx          → Login (empresa ou voluntário)
│   │   └── register/page.tsx       → Cadastro
│   ├── enterprise/
│   │   ├── layout.tsx              → Layout com sidebar
│   │   ├── dashboard/page.tsx      → Dashboard da empresa
│   │   ├── acoes/page.tsx          → CRUD de ações + orquestração IA
│   │   └── perfil/page.tsx         → Perfil da empresa
│   └── volunteer/
│       ├── layout.tsx              → Layout com sidebar
│       ├── dashboard/page.tsx      → Dashboard + toggle de status
│       ├── notificacoes/page.tsx   → Aceitar/recusar missões
│       └── perfil/page.tsx         → Perfil do voluntário
├── components/
│   └── shared/Sidebar.tsx          → Sidebar compartilhada
└── lib/
    ├── api.ts                      → Cliente HTTP + tipos
    ├── auth.tsx                    → Context de autenticação
    └── constants.ts                → Skills, estados, labels
```

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variável de ambiente
cp .env.local.example .env.local
# Edite .env.local e defina NEXT_PUBLIC_API_URL com a URL do seu backend

# 3. Rodar em desenvolvimento
npm run dev
```

## Rotas do backend integradas

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/volunteer` | POST | Cadastro de voluntário |
| `/volunteer/login` | POST | Login de voluntário |
| `/volunteer/:id` | GET/PUT/DELETE | Perfil |
| `/volunteer/:id/status` | PUT | Alterar disponibilidade |
| `/enterprise` | POST | Cadastro de empresa |
| `/enterprise/login` | POST | Login de empresa |
| `/enterprise/:id` | GET/PUT/DELETE | Perfil da empresa |
| `/acoes` | POST | Criar ação de crise |
| `/acoes/empresa/:id` | GET | Listar ações da empresa |
| `/acoes/:id` | GET/PUT/DELETE | Gerenciar ação |
| `/acoes/:id/orchestrate` | POST | Orquestrar com Watson IA |

## Notas

- **Autenticação**: JWT salvo em localStorage. O token é enviado automaticamente em todas as requests.
- **Notificações**: A página de notificações do voluntário usa mock por enquanto. 
  Integre com a rota real de notificações quando o backend expô-la.
- **Status do voluntário**: "ativo" = disponível para ser selecionado pela IA.
