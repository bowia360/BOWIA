# Decisions Log — BOW IA Studio

> Log de decisões importantes, com data e motivo. Formato ADR simplificado:
> **Contexto → Decisão → Motivo → Alternativas consideradas → Status**

---

### #001 — Cadastro: gated, aberto, ou híbrido?
**Status:** ✅ decidido — 2026-06-23

**Decisão:** Híbrido leve. Cadastro é **livre e imediato** — qualquer pessoa cria
conta sem pagar nada antes (sem espera de webhook). Acesso a conteúdo de valor
(abrir uma Trilha, Galeria completa, Estúdio UGC) fica condicionado a
`subscriptions.status = 'active'`, checado em tempo real via middleware/guard
no Next.js.

**Motivo:** o Studio é vendido como order bump no workshop (BOW Innovation
Works). Com gated rígido, o webhook do Asaas precisaria criar conta do zero no
momento da compra (`auth.users` + `profile` + `subscription` tudo junto) — mais
superfície de falha (pagou e não recebeu acesso = ticket de suporte). Com
híbrido, a pessoa pode criar conta antes mesmo de decidir comprar; quando paga,
o webhook só precisa "ligar" a assinatura numa conta que já existe (`UPDATE
subscriptions`), processo mais simples e mais robusto.

**Ganho colateral:** shell e catálogo de Formações (capa + descrição) funcionam
como vitrine gratuita — visitante vê o produto antes de decidir, gera prova
social/curiosidade, parecido com o catálogo aberto da ASIMOV.

**Implementação:** guard de acesso roda no middleware do Next.js, checando
`subscriptions` ativa do usuário antes de liberar rotas de Trilha/Estúdio/Galeria
completa. Páginas de "vitrine" (lista de Formações, landing de planos) ficam
sempre acessíveis a qualquer usuário autenticado.

**Alternativas consideradas:**
- Aberto puro — descartado, sem paywall não há monetização
- Gated rígido — descartado, fricção de onboarding e webhook mais arriscado para o modelo de combo com workshop

---

### #002 — Supabase Cloud vs. self-hosted (VPS própria)
**Status:** ✅ decidido — 2026-06-23

**Contexto:** Rafael já tem Supabase self-hosted na própria VPS via Coolify
("Social Painel"), usado por outros produtos internos (não expostos a pagamento
de terceiros).

**Decisão:** Studio usa **Supabase Cloud**, projeto novo e isolado (`studiobowia`,
ref `oqfyuigdhdpnvlprqdvj`), na conta separada `bowia360@gmail.com`.

**Motivo:** o Studio vai cobrar de gente de fora — precisa de backup automático,
isolamento de rede gerenciado, e patches de segurança sem o Rafael precisar ser
DBA. Self-hosted faz sentido pra ferramenta interna onde o próprio Rafael
controla o risco; não para produto pago com terceiros.

**Alternativas consideradas:**
- Self-hosted na mesma instância do Social Painel, schema separado (Nível 1) — descartado, isolamento fraco
- Self-hosted, banco separado, mesma instância (Nível 2) — seria aceitável, mas Cloud já resolve com menos esforço operacional
- Instância Supabase nova no próprio Coolify (Nível 3) — over-engineering para o estágio atual, consome recursos da VPS sem necessidade clara

**Custo confirmado:** R$ 0/mês no plano atual (Free tier cobre Fase 0–1).

---

### #003 — Modelo de consumo do Estúdio UGC (crédito vs. cota)
**Status:** 🟡 schema pronto para os dois caminhos, decisão de negócio pendente

**Contexto:** geração de vídeo (Veo3) e imagem (Nano Banana) via fal.ai tem custo
real por chamada. Sem medição, vira prejuízo.

**Decisão de engenharia (já aplicada):** `credit_ledger` modelado como livro-caixa
(delta + motivo), não como saldo fixo — suporta tanto débito por geração avulsa
quanto crédito recorrente vindo de cota de plano, sem mudança de schema.

**Decisão de negócio (pendente):** definir se será (a) crédito numérico simples
por unidade consumida, (b) cota mensal fixa por plano sem crédito avulso, ou (c)
híbrido (cota do plano + possibilidade de comprar crédito extra).

**Recomendação registrada:** modelo híbrido — trilha leve (galeria, gerador de
prompt) na assinatura; UGC pesado por crédito; BYOK permite economizar crédito.

---

### #004 — Gateway de pagamento
**Status:** ✅ decidido — 2026-06-23

**Decisão:** Asaas como único gateway na v1.

**Motivo:** Rafael já tem conta Asaas ativa e verificada (zero fricção de KYC).
Público do Studio é 100% brasileiro — PIX e boleto nativos do Asaas convertem
melhor que cartão nesse perfil de oferta (mesmo padrão do funil de workshop:
Lote 1 R$97 / Lote 2 R$197, ticket baixo onde PIX é decisivo).

**Limitação aceita:** Asaas não tem retry automático de cobrança falha tão
maduro quanto Stripe Billing. Mitigação: workflow no n8n — webhook do Asaas
("pagamento falhou") → notificação via WhatsApp/e-mail → nova tentativa.
Aproveita a infra e expertise que o Rafael já tem em n8n.

**Caminho de expansão:** `subscriptions.provider` já é campo texto livre — se
um dia o Studio vender para fora do Brasil, Stripe pode ser adicionado como
segundo provider sem mudança de schema, não é decisão fechada para sempre.

**Alternativa considerada:** Stripe — descartado por agora (conta nova exigiria
KYC, sem ganho real para público 100% nacional nesse estágio).

---

### #005 — Frontend: Next.js (não Lovable, não Vite puro)
**Status:** ✅ decidido — 2026-06-23

**Decisão:** Next.js (App Router), código no Cursor via Claude Code.

**Motivo:** Rafael decidiu explicitamente não usar Lovable — quer controle total
de código, sem vendor lock-in de no-code. Next.js dá rotas protegidas nativas,
API routes server-side (essencial para nunca expor chave de IA no client), e
suporte de primeira a Supabase via `@supabase/ssr`. Roda em Docker no Coolify.

**Alternativa considerada:** Vite + React puro — descartado por exigir montar
manualmente o que o Next.js já resolve nativamente (rotas server-side, middleware
de auth).

---

### #006 — Formato de chave Supabase: legacy JWT vs. novo `sb_publishable_/sb_secret_`
**Status:** ✅ decidido — 2026-06-23

**Decisão:** usar o par legacy `anon` / `service_role` (formato JWT) por agora.

**Motivo:** maior compatibilidade testada com Next.js e `@supabase/ssr` hoje.
Migração para o formato novo é troca de duas variáveis de ambiente — não é
decisão estrutural, pode ser revisitada sem custo de retrabalho.

---

### #007 — Exposição acidental da `service_role key` em chat
**Status:** ⚠️ ação pendente

**Contexto:** durante a configuração inicial, a `service_role key` do projeto
`studiobowia` foi colada em texto puro nesta conversa.

**Ação registrada:** girar (regenerar) a chave em `Project Settings → API Keys →
Secret keys` assim que o schema estiver criado e estável, e atualizar `.env`
local. Não é uma emergência (conversa privada), mas é a prática correta de
higiene de segredo.
