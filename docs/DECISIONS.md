# Decisions Log — BOW Creator

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

**Motivo:** o Creator é vendido como order bump no workshop (BOW Innovation
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

**Decisão:** Creator usa **Supabase Cloud**, projeto novo e isolado (`studiobowia`,
ref `oqfyuigdhdpnvlprqdvj`), na conta separada `bowia360@gmail.com`.

**Motivo:** o Creator vai cobrar de gente de fora — precisa de backup automático,
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
Público do Creator é 100% brasileiro — PIX e boleto nativos do Asaas convertem
melhor que cartão nesse perfil de oferta (mesmo padrão do funil de workshop:
Lote 1 R$97 / Lote 2 R$197, ticket baixo onde PIX é decisivo).

**Limitação aceita:** Asaas não tem retry automático de cobrança falha tão
maduro quanto Stripe Billing. Mitigação: workflow no n8n — webhook do Asaas
("pagamento falhou") → notificação via WhatsApp/e-mail → nova tentativa.
Aproveita a infra e expertise que o Rafael já tem em n8n.

**Caminho de expansão:** `subscriptions.provider` já é campo texto livre — se
um dia o Creator vender para fora do Brasil, Stripe pode ser adicionado como
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

---

### #008 — Nome final do produto e domínio próprio (não subdomínio)
**Status:** ✅ decidido — 2026-06-23

**Decisão:** o produto se chama **BOW Creator**, com domínio próprio
**bowcreator.com.br** — não um subdomínio de bowia.com.br.

**Motivo:** Rafael confirmou que quer o produto claramente dentro da família
BOW (aproveitando autoridade já construída: ESX 2026, OpenStartups, cases
reais), mas também confirmou que o produto pode crescer e ser vendido sozinho
no futuro, sem depender do workshop como funil único. Subdomínio
(`studio.bowia.com.br`) prenderia a percepção de "seção de outro site" e
geraria custo de migração (perda de SEO acumulado, gestão de redirects) se um
dia precisasse virar domínio próprio. Custo de registro de domínio
(~R$40/ano) é desprezível frente a esse risco — melhor registrar certo desde o início.

**Por que "Creator" e não "Studio":** "Studio" colidia conceitualmente com
"BOW IA Studio", nome de trabalho usado nas primeiras sessões de planejamento,
mas também soava genérico demais. "Creator" comunica diretamente a tese do
produto (o aluno cria/produz, não só assiste) e evita colisão de nome com
`bowia.com.br` (o workshop) e `bow360.cloud` (infraestrutura). O próprio
Rafael já estava nomeando a pasta local do projeto como "BOW-CREATOR" antes
mesmo dessa decisão formal — sinal de que o nome já tinha se firmado na prática.

**Identidade visual:** mantém o design system de `bowia.com.br` (grid + glass
+ azul neon + Sora/Inter) para reforçar a família visual, mesmo com domínio
separado — ver DESIGN-SYSTEM.md.

**Ação pendente:** registrar `bowcreator.com.br` o mais rápido possível para
reservar o nome, mesmo antes do deploy estar pronto.

---

### #009 — Painel administrativo para gestão de conteúdo
**Status:** 🟡 reconhecido, não implementado ainda

**Contexto:** `profiles.role` já modela `'student' | 'admin'` desde o schema
original (DATABASE.md), e as policies de RLS já restringem escrita em
`prompts`/`formations`/`tracks`/`courses`/`lessons` a `service_role` — ou seja,
o banco já está pronto para isso. O que falta é a **interface**.

**Decisão:** criar uma Fase dedicada (ver ROADMAP.md "Fase Admin") para uma
área `/admin` protegida por `role = 'admin'`, com CRUD simples para:
- Prompts da Galeria (título, categoria, texto, preview)
- Formações → Trilhas → Cursos → Aulas (estrutura completa)
- Planos de assinatura

**Por que não é parte da Fase 1:** misturar CRUD de admin com a primeira tela
pública (Galeria) atrasaria a entrega visual. Melhor entregar a Galeria
funcionando com seed manual primeiro, validar a experiência do aluno, e só
depois construir a ferramenta de gestão — o Rafael não vai precisar cadastrar
conteúdo em volume alto nas primeiras semanas.

**Alternativa descartada por agora:** usar um CMS headless externo (Sanity,
Strapi) — adicionaria uma peça de infra extra sem necessidade clara no estágio
atual; o painel próprio é mais simples e já usa a mesma stack (Next.js +
Supabase) sem custo adicional.

---

### #010 — Provider gerenciado padrão do Gerador de Prompt (Fase 2)
**Status:** ✅ decidido — 2026-06-23

**Decisão:** Claude (Anthropic) como provider gerenciado padrão.

**Motivo:** Rafael já tem `ANTHROPIC_API_KEY` ativa (mesma usada pelo Claude
Code) — zero setup novo. Tecnicamente, Claude tende a produzir descrições
visuais mais estruturadas e detalhadas, o que é exatamente o formato que um
prompt de imagem/vídeo (Nano Banana, Veo3) precisa — evita prompts genéricos
ou rasos demais.

**Não é decisão exclusiva:** BYOK (DECISIONS.md, ver PRD.md seção 5) já
permite o aluno avançado plugar GPT ou Gemini por conta própria. Esta decisão
define apenas o que roda quando o aluno **não** configurou chave própria.

**Alternativas consideradas:**
- GPT — sem vantagem técnica clara sobre Claude para este caso, exigiria
  configurar uma chave nova
- Gemini — mais barato por token e multimodal nativo (útil para análise de
  imagem futura), mas qualidade de prompt descritivo menos consistente nos
  testes informais até aqui; pode ser revisitado se o volume de uso justificar
  o custo menor

---

### #011 — Inverter ordem: Estúdio UGC (Fase 4) antes do Cofre de Chaves (Fase 3)
**Status:** ✅ decidido — 2026-06-23

**Decisão:** construir o Estúdio UGC (geração de imagem/vídeo via fal.ai,
usando chave gerenciada) antes do Cofre de Chaves / BYOK.

**Motivo:** BYOK só tem valor real depois que existe uma ferramenta para a
chave do usuário ser usada. Construir o Cofre de Chaves primeiro significaria
testar "salvar e criptografar uma chave" sem nenhum consumo real dela — função
sem propósito visível. Construindo o Estúdio UGC primeiro com a chave
gerenciada (`FAL_API_KEY`, já configurada desde a Fase 0), validamos o fluxo
completo (prompt → geração → resultado) e só depois adicionamos BYOK como
upgrade ("agora você pode plugar sua própria chave para economizar crédito"),
em vez de construir no vácuo.

**Numeração das fases no ROADMAP.md:** mantém os nomes "Fase 3" e "Fase 4"
como estavam (para não reescrever referências cruzadas em outros documentos),
mas a ordem de execução real passa a ser Fase 4 → Fase 3.
