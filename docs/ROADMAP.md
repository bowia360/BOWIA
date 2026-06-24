# Roadmap — BOW Creator

## Como usar este arquivo

Cada fase tem status (`não iniciado` / `em andamento` / `concluído`) e uma lista de
entregáveis. Atualizar o status conforme o trabalho avança — este é o painel de
controle do projeto, junto com Linear (`linear.app/bow360/team/BOW`).

---

## Fase 0 — Fundação
**Status:** em andamento

- [ ] **Registrar o domínio bowcreator.com.br** (ver DECISIONS.md #008) ← ação simples, fazer logo
- [x] Design system extraído do CSS real (`DESIGN-SYSTEM.md`)
- [x] Mockup de login fiel ao design system (Visualizer)
- [x] Schema de banco v2 desenhado (Formação→Trilha→Curso→Aula + UGC + créditos)
- [x] SQL completo com RLS pronto (`DATABASE.md`)
- [x] Projeto Supabase `studiobowia` criado (conta `bowia360@gmail.com`)
- [x] Repositório `github.com/bowia360/BOWIA` criado
- [x] **Rodar o SQL de `DATABASE.md` no painel Supabase** — 13 tabelas confirmadas
- [x] Girar a `service_role key` exposta em chat
- [x] Scaffold do Next.js no repo, com `.env.example` preenchido
- [x] Tela de login/cadastro real (não mockup) conectada ao Supabase Auth — cadastro livre e imediato
- [x] Decisão: cadastro híbrido leve (DECISIONS.md #001) — livre + paywall por assinatura
- [x] Guard de assinatura **Parte 1** — gate em Server Component por rota gated, tela `/planos`, NavRail com cadeado cosmético (DECISIONS.md #016 — 2026-06-24)
- [x] Guard de assinatura **Parte 2** — checkout Asaas (billingType UNDEFINED, CPF inline), webhook `/api/webhooks/asaas`, `utils/asaas.ts` (DECISIONS.md #017 — 2026-06-24); **código aplicado, NÃO testado — requer credenciais sandbox + URL pública (ngrok ou deploy)**
- [x] Shell de navegação (rail lateral + área de conteúdo)

## Fase 1 — Galeria de Prompts
**Status:** concluído

- [x] Seed de prompts de exemplo na tabela `prompts` (docs/seed-prompts.sql)
- [x] Grid filtrável por categoria + busca
- [x] Modal de preview com copiar + favoritar
- [x] Tela "Meus favoritos"

## Fase Admin — Painel de gestão de conteúdo
**Status:** concluído

- [x] Rota `/admin` protegida por `profiles.role = 'admin'`
- [x] CRUD de Prompts (substitui inserts manuais via SQL Editor)
- [x] CRUD de Formações → Trilhas → Cursos → Aulas
- [ ] CRUD de Planos
- [ ] Upload de imagens (preview de prompt, capa de formação) via Supabase Storage

## Fase 2 — Gerador de Prompt
**Status:** concluído

- [x] Decisão de provider padrão (gerenciado) — **Claude** (DECISIONS.md #010)
- [x] Interface de descrição → prompt gerado
- [x] Integração com Claude via API route do Next.js (GPT/Gemini disponíveis via BYOK)

## Fase 3 — Cofre de Chaves (BYOK)
**Status:** concluído

- [x] Decisão de criptografia — AES-256-GCM via Node crypto + ENCRYPTION_KEY (ver DECISIONS.md #012)
- [x] Tela "Conexões" (/conexoes) — 4 providers, salvar/substituir/remover
- [ ] Validação de chave ao salvar (testar a chave antes de marcar `is_active`) — iteração futura

## Fase 4 — Estúdio UGC · Imagem
**Status:** em andamento

- [x] Tela de submissão (prompt + imagem de referência via URL)
- [x] API route server-side: cria `generations`, dispara webhook n8n
- [x] Webhook callback `/api/webhooks/fal-callback` para n8n → Next.js
- [x] Status em tempo real via polling (`queued → generating_image → done`)
- [x] Mock mode (`UGC_MOCK_MODE=true`) para testar sem n8n — validado
- [ ] Workflow real do n8n: recebe webhook → fal.ai Nano Banana → callback (adiado para depois do deploy, ver DECISIONS.md #012)

## Fase 5 — Estúdio UGC · Vídeo + Créditos + Histórico
**Status:** não iniciado

- [ ] Workflow n8n: encadeia imagem → Veo3 → callback
- [ ] Lógica de débito em `credit_ledger` por geração
- [ ] Galeria pessoal de gerações ("Meus vídeos")
- [ ] Decisão final: crédito avulso vs. cota de plano vs. híbrido (DECISIONS.md #003)

## Fase 6 — Trilhas + Assinatura
**Status:** concluído (telas de conteúdo); Asaas/pagamento em sessão dedicada futura

- [x] Telas: lista de Formações (`/formacoes`), currículo de Trilha, player de Aula com progresso — **testado end-to-end via admin (2026-06-23); ajustes UX aplicados: color-scheme dark, player max-w, fallback de capa (DECISIONS.md #015)**
- [x] CRUD admin completo: Formações → Trilhas → Cursos → Aulas (drill-down com breadcrumb)
- [x] Progresso por aula — `lesson_progress` com upsert + "Marcar como concluída"
- [x] Decisão de gateway de pagamento — **Asaas** (DECISIONS.md #004)
- [ ] Seed das 5 Formações de topo (PRD.md seção 4) — popular via admin panel
- [~] Webhook Asaas + checkout — **código aplicado (2026-06-24), NÃO testado; requer credenciais sandbox + URL pública (ngrok ou deploy)**
- [ ] Workflow n8n: webhook "pagamento falhou" → notificação WhatsApp/e-mail → retry

## Fase 7 — Empacotar a oferta combo
**Status:** não iniciado

- [ ] Order bump do Creator na oferta do BOW Innovation Works
- [ ] Página de planos/preços

---

## Decisões pendentes que bloqueiam fases futuras

| # | Decisão | Bloqueia | Ver |
|---|---|---|---|
| 003 | Crédito avulso vs. cota de plano vs. híbrido | Fase 5 (lógica de débito) | DECISIONS.md |
