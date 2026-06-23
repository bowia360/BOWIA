# Arquitetura — BOW IA Studio

## Stack

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | **Next.js** (App Router) | Rotas protegidas via middleware, API routes server-side (nunca expor chave de IA no client), suporte de primeira a Supabase via `@supabase/ssr`, roda em Docker no Coolify sem lock-in de Vercel |
| Hospedagem frontend | **Coolify** (VPS própria do Rafael) | Mesma infra que já hospeda `automacoes.bow360.cloud` e `colifysocialpainel.bow360.cloud` |
| Banco / Auth / Storage | **Supabase Cloud** — projeto `studiobowia` (ref `oqfyuigdhdpnvlprqdvj`), região `sa-east-1` | Projeto isolado, separado do Site-HUB (`gufhdjjuxldjvvwcoeqw`) e do Social Painel (self-hosted via Coolify). Ver DECISIONS.md #002 sobre a escolha Cloud vs. self-hosted. |
| Orquestração de fluxos de IA | **n8n** (`automacoes.bow360.cloud`) | Onde o Rafael já tem expertise e workflows de produção. Webhooks recebem chamada do Next.js, orquestram fal.ai/OpenAI/Gemini/Claude, retornam via callback. |
| Geração de imagem/vídeo | **fal.ai** — Nano Banana (imagem), Veo3 (vídeo) | Mesmas ferramentas do blueprint original em PDF |
| Geração/análise de texto | **OpenAI, Gemini, Claude** (BYOK ou gerenciado) | Gerador de prompt + análise de imagem |
| Repositório | `github.com/bowia360/BOWIA` | Conta separada (`bowia360@gmail.com`), isolada da conta pessoal do Rafael |
| Editor | Cursor + Claude Code | Decisão explícita: **não usar Lovable** — controle total de código |

## Infraestrutura existente do Rafael (contexto, não construir do zero)

- **VPS com Coolify** — já hospeda Social Painel, n8n, outros serviços BOW 360
- **Supabase self-hosted** (`supabase.bow360.cloud`) — usado por outros produtos (Social Painel). **Não usado pelo Studio** — Studio usa Supabase Cloud separado.
- **n8n** (`automacoes.bow360.cloud`) — já em produção, com regras de segurança estabelecidas (ver abaixo)
- **GitHub** — org pessoal `BOW360`, conta separada `bowia360` para este projeto
- **Linear** (`linear.app/bow360/team/BOW`) e **Miro** — já conectados como ferramentas de gestão

## Regras de workflow herdadas do Rafael (aplicam-se também ao Studio)

> Estas regras já são praticadas pelo Rafael em outros projetos n8n/produção e
> devem ser seguidas por qualquer agente (Claude Code, Cursor, ou humano) trabalhando neste projeto:

1. **Sempre GET antes de PUT** — nunca sobrescrever staticData de workflow sem ler o estado atual primeiro
2. **Nunca iterar direto em workflow de produção** — usar cópia inativa para testes
3. **Mostrar evidência antes de aplicar** — "show me before applying": qualquer mudança em schema, workflow ou config de produção precisa ser exibida e confirmada antes de execução
4. **Step-by-step com gates de aprovação** antes de mudanças em produção

## Fluxo de dados — Estúdio UGC (melhorias sobre o blueprint original)

O PDF de referência descreve um fluxo linear simples (form → espera → e-mail). O
Studio melhora isso em 4 pontos (ver PRD.md seção 3.2 e DECISIONS.md):

1. **Fila assíncrona com status visível** — `generations.status` transita entre
   `queued → generating_image → generating_video → done/failed`, refletido em tempo
   real na UI (Supabase Realtime ou polling leve)
2. **Callback, não polling** — fal.ai chama de volta um webhook do n8n quando termina,
   em vez do n8n perguntar repetidamente
3. **Histórico persistido desde o dia 1** — toda geração salva em `generations`
   (Supabase), não é "extensão futura" como no PDF original — é base
4. **Créditos por geração** — cada chamada de API tem custo real; sem medição,
   vira prejuízo (ver DATABASE.md tabela `credit_ledger`)

```
[Next.js — formulário do Estúdio]
        │ (server action / API route)
        ▼
[n8n webhook] ──► [fal.ai: Nano Banana] ──► imagem gerada
        │                                         │
        │                                         ▼
        └──────────────────────────────► [fal.ai: Veo3] ──► vídeo gerado
                                                   │
                                                   ▼
                                    [callback → n8n → Supabase: generations.status = done]
                                                   │
                                                   ▼
                                    [Supabase Realtime → Next.js atualiza UI]
                                                   │
                                                   ▼
                                       [Gmail: e-mail com link, opcional]
```

## Segurança — chaves de API (BYOK)

- Chaves de terceiros (fal.ai, OpenAI, Gemini, Claude) inseridas pelo usuário em
  `api_connections.encrypted_key` — **nunca texto puro**
- Criptografia via Supabase Vault (pgsodium) ou equivalente — decisão de
  implementação na Fase 3
- **Toda chamada de API de IA passa pelo backend** (Next.js API route ou n8n) —
  nunca direto do navegador do usuário
- `service_role key` do Supabase: tratada como segredo de root. Girar
  (regenerar) sempre que houver suspeita de exposição (ex: colada em chat,
  print, repositório público)

## O que falta decidir (ver DECISIONS.md)

- Gateway de pagamento (Stripe vs. Asaas) — trava o desenho de `subscriptions`/webhooks
- Cadastro gated vs. aberto vs. híbrido
- Formato de chave Supabase: legacy JWT (atual) vs. novo `sb_publishable_/sb_secret_`
