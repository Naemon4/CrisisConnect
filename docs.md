# Setup do ngrok — CrisisConnect

## O que é o ngrok?

O ngrok cria um **túnel reverso** entre seu servidor local e a internet. Em vez de abrir portas no roteador, seu PC inicia uma conexão de saída para os servidores do ngrok, que repassam o tráfego até o seu `localhost`.

```
Orchestrate → servidores do ngrok → túnel seguro → localhost:3000
```

---

## 1. Instalação

### Via winget (Windows)
```bash
winget install Ngrok.Ngrok
```

> Se aparecer erro de versão desatualizada, rode:
> ```bash
> ngrok update
> ```
> Ou baixe direto em [ngrok.com/download](https://ngrok.com/download)

---

## 2. Criar conta e autenticar

1. Crie uma conta gratuita em [ngrok.com](https://ngrok.com)
2. No dashboard, copie seu **authtoken**
3. Rode no terminal:

```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

---

## 3. Rodar o túnel

Com o servidor Express rodando (`npm run dev`), abra **outro terminal** e rode:

```bash
ngrok http 3000
```

A saída vai ser parecida com:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

A URL `https://abc123.ngrok-free.app` é sua URL pública — use ela no `openapi.yaml`.

> ⚠️ **Atenção:** No plano gratuito, a URL muda toda vez que o ngrok é reiniciado. Durante apresentações, **não feche o terminal do ngrok**.

---

## 4. Atualizar o openapi.yaml

Cole a URL gerada no campo `servers` do seu `openapi.yaml`:

```yaml
openapi: 3.0.0
info:
  title: CrisisConnect Tools
  version: 1.0.0
servers:
  - url: https://abc123.ngrok-free.app  # ← sua URL do ngrok
paths:
  /tools/buscar-voluntarios:
    post:
      summary: Busca voluntários disponíveis por habilidades
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                habilidades:
                  type: array
                  items:
                    type: string
                quantidade:
                  type: integer
      responses:
        '200':
          description: Lista de voluntários

  /tools/notificar-voluntario:
    post:
      summary: Notifica um voluntário sobre uma ação de crise
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                voluntario_id:
                  type: integer
                acao_id:
                  type: integer
                mensagem:
                  type: string
      responses:
        '200':
          description: Confirmação
```

---

## 5. Importar no Watson Orchestrate

1. Acesse [cloud.ibm.com](https://cloud.ibm.com) e entre no **watsonx Orchestrate**
2. Vá em **Skills and Apps** → **Add Skills** → **From a file**
3. Faça upload do `openapi.yaml` atualizado com a URL do ngrok
4. Selecione as operações que deseja importar como tools
5. Publique as skills

---

## Fluxo completo

```
npm run dev          → Express rodando em localhost:3000
ngrok http 3000      → URL pública gerada
openapi.yaml         → URL do ngrok no campo servers
Watson Orchestrate   → importa o yaml e chama suas tools
```

---

## Troubleshooting

| Erro | Solução |
|------|---------|
| `authentication failed: agent version too old` | Rode `ngrok update` ou baixe a versão mais recente em ngrok.com/download |
| URL mudou e o Orchestrate parou de funcionar | Reinicie o ngrok, atualize a URL no `openapi.yaml` e reimporte no Orchestrate |
| `There was no server found in the OpenAPI definition` | Adicione o campo `servers` com exatamente uma URL no `openapi.yaml` |
| Orchestrate não consegue chamar os endpoints | Verifique se o Express está rodando e se o ngrok está ativo no terminal |