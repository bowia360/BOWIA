# Roadmap — BOW IA Studio

## Como usar este arquivo

Cada fase tem status (`não iniciado` / `em andamento` / `concluído`) e uma lista de
entregáveis. Atualizar o status conforme o trabalho avança — este é o painel de
controle do projeto, junto com Linear (`linear.app/bow360/team/BOW`).

---

## Fase 0 — Fundação
**Status:** em andamento

- [x] Design system extraído do CSS real (`DESIGN-SYSTEM.md`)
- [x] Mockup de login fiel ao design system (Visualizer)
- [x] Schema de banco v2 desenhado (Formação→Trilha→Curso→Aula + UGC + créditos)
- [x] SQL completo com RLS pronto (`DATABASE.md`)
- [x] Projeto Supabase `studiobowia` criado (conta `bowia360@gmail.com`)
- [x] Repositório `github.com/bowia360/BOWIA` criado
- [ ] **Rodar o SQL de `DATABASE.md` no painel Supabase** ← próxima ação do Rafael
- [ ] Girar a `service_role key` exposta em chat
- [ ] Scaffold do Next.js no repo, com `.env.example` preenchido
- [ ] Tela de login/cadastro real (não mockup) conectada ao Supabase Auth — cadastro livre e imediato
- [x] Decisão: cadastro híbrido leve (DECISIONS.md #001) — livre + paywall por assinatura
- [ ] Middleware de guard: checa `subscriptions.status = 'active'` antes de liberar Trilha/Estúdio/Galeria completa
- [ ] Shell de navegação (rail lateral + área de conteúdo)

## Fase 1 — Galeria de Prompts
**Status:** não iniciado

- [ ] Seed de prompts de exemplo na tabela `prompts`
- [ ] Grid filtrável por categoria + busca
- [ ] Modal de preview com copiar + favoritar
- [ ] Tela "Meus favoritos"

## Fase 2 — Gerador de Prompt
**Status:** não iniciado

- [ ] Decisão de provider padrão (gerenciado) para o gerador
- [ ] Interface de descrição → prompt gerado
- [ ] Integração com Claude/GPT/Gemini via API route do Next.js

## Fase 3 — Cofre de Chaves (BYOK)
**Status:** não iniciado

- [ ] Decisão de criptografia (Supabase Vault / pgsodium ou alternativa)
- [ ] Tela "Conexões" no perfil
- [ ] Validação de chave ao salvar (testar a chave antes de marcar `is_active`)

## Fase 4 — Estúdio UGC · Imagem
**Status:** não iniciado

- [ ] Workflow n8n: recebe webhook → fal.ai Nano Banana → callback
- [ ] Tela de submissão (descrição + imagem de referência)
- [ ] Status em tempo real (`queued → generating_image → done`)

## Fase 5 — Estúdio UGC · Vídeo + Créditos + Histórico
**Status:** não iniciado

- [ ] Workflow n8n: encadeia imagem → Veo3 → callback
- [ ] Lógica de débito em `credit_ledger` por geração
- [ ] Galeria pessoal de gerações ("Meus vídeos")
- [ ] Decisão final: crédito avulso vs. cota de plano vs. híbrido (DECISIONS.md #003)

## Fase 6 — Trilhas + Assinatura
**Status:** não iniciado

- [ ] Seed das 5 Formações de topo (PRD.md seção 4)
- [ ] Telas: lista de Formações, página de Trilha, player de Aula
- [x] Decisão de gateway de pagamento — **Asaas** (DECISIONS.md #004)
- [ ] Webhook do Asaas → cria/atualiza `subscriptions`
- [ ] Workflow n8n: webhook "pagamento falhou" → notificação WhatsApp/e-mail → retry

## Fase 7 — Empacotar a oferta combo
**Status:** não iniciado

- [ ] Order bump do Studio na oferta do BOW Innovation Works
- [ ] Página de planos/preços

---

## Decisões pendentes que bloqueiam fases futuras

| # | Decisão | Bloqueia | Ver |
|---|---|---|---|
| 003 | Crédito avulso vs. cota de plano vs. híbrido | Fase 5 (lógica de débito) | DECISIONS.md |
