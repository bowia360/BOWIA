# API Integrations — BOW Creator

> Contratos de chamada e convenções para cada integração externa. Chaves reais
> nunca aparecem aqui — sempre referenciadas via variável de ambiente (ver `.env.example`).

## fal.ai — geração de imagem e vídeo

**Modelos usados:** Nano Banana (imagem), Veo3 (vídeo)
**Docs:** https://fal.ai/docs

**Padrão de chamada:** sempre via n8n (`automacoes.bow360.cloud`), nunca direto
do Next.js client. Fluxo:

1. Next.js API route recebe o pedido do usuário (prompt + imagem de referência opcional)
2. Next.js cria uma linha em `generations` (status `queued`) e dispara webhook do n8n
3. n8n chama fal.ai (Nano Banana primeiro, se for vídeo encadeia com Veo3 depois)
4. fal.ai processa **assincronamente** e chama de volta um webhook do n8n quando termina (callback, não polling — ver ARCHITECTURE.md)
5. n8n atualiza `generations.status` e `generations.output_url` no Supabase
6. Frontend reflete a mudança via Supabase Realtime (subscription na tabela `generations` filtrada por `profile_id`)

**Variáveis necessárias:** `FAL_API_KEY` (gerenciada) — quando BYOK estiver ativo,
a chave do usuário (`api_connections` descriptografada) substitui a gerenciada
para aquela chamada específica.

## OpenAI / Gemini / Claude — gerador de prompt e análise de imagem

**Uso:** Gerador de Prompt (Fase 2) — descrição em linguagem natural → prompt
estruturado pronto para usar no Estúdio UGC ou em ferramentas externas.

**Padrão de chamada:** via API route do Next.js (server-side), nunca client-side.

**Provider padrão (gerenciado):** a definir na Fase 2 — recomenda-se começar com
um único provider gerenciado (ex: Claude ou GPT) para simplificar, com BYOK
opcional liberando escolha de provider.

**Variáveis necessárias:** `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`
(gerenciadas) — mesma lógica de substituição por chave BYOK do usuário quando aplicável.

## n8n — orquestração

**Instância:** `automacoes.bow360.cloud`
**MCP já conectado:** sim, nesta sessão de chat (`n8n` na lista de MCP servers do usuário)

**Regras de produção (herdadas, ver ARCHITECTURE.md):**
- Sempre GET antes de PUT (nunca sobrescrever staticData sem ler estado atual)
- Nunca editar workflow de produção direto — usar cópia inativa para testes
- Mostrar evidência antes de aplicar mudança

**Webhooks a criar (Fase 4–5):**
- `POST /webhook/ugc-image-start` — recebe prompt + imagem de referência, inicia geração de imagem
- `POST /webhook/ugc-video-start` — recebe imagem gerada, inicia geração de vídeo
- `POST /webhook/fal-callback` — recebe callback do fal.ai quando job termina, atualiza Supabase

## Gmail — entrega por e-mail (opcional)

**Uso:** notificação de geração concluída, complementar ao status em tempo real
na UI (não é o canal primário de entrega, como era no blueprint original em PDF —
agora é canal secundário).

## Supabase — banco, auth, storage

Ver `DATABASE.md` para schema completo e `.env.example` para variáveis.

**MCP conectado nesta sessão:** sim, mas autenticado na conta pessoal do Rafael
(`Hub-Centro-Metropolitano-V2`), que **não vê** o projeto `studiobowia` (criado em
`bowia360@gmail.com`). Para inspeção via MCP do projeto do Creator, reconectar
com a conta certa no Claude Code/Cursor, ou operar via SQL Editor manual no painel.
