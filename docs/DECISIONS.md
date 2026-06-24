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

---

### #012 — Workflow real do n8n adiado para depois do deploy
**Status:** ✅ decidido — 2026-06-23

**Contexto:** o Estúdio UGC · Imagem foi codado e testado com sucesso usando
`UGC_MOCK_MODE=true` (fluxo completo de fila/status/resultado validado). Para
testar o n8n real, seria necessário expor o `localhost` do Rafael publicamente
via túnel temporário (ngrok ou similar), já que o n8n roda numa VPS separada
(`automacoes.bow360.cloud`) e precisa de um endereço público para chamar o
callback de volta.

**Decisão:** adiar a configuração do workflow real do n8n para depois do
deploy em `bowcreator.com.br` — quando o Next.js estiver publicamente
acessível, o n8n pode chamar o callback diretamente, sem necessidade de túnel
temporário.

**Motivo:** evitar trabalho duplicado (configurar ngrok agora, testar, depois
reconfigurar tudo de novo com a URL de produção). O modo mock já validou que
a estrutura de dados e o fluxo de UI funcionam corretamente — o que falta é
só a chamada real ao fal.ai, que pode ser conectada quando o domínio estiver
ativo.

**Estado deixado para retomar:** `UGC_MOCK_MODE=true` permanece no
`.env.local` até este ponto ser revisitado. Os contratos de payload dos três
endpoints (`/api/estudio/gerar-imagem`, webhook `ugc-image-start` do n8n,
`/api/webhooks/fal-callback`) já estão documentados e não devem mudar quando
o n8n real for configurado.

---

### #013 — Estúdio UGC · Vídeo (Veo3) pausado por falta de chave de API
**Status:** ⏸️ pausado — 2026-06-23

**Contexto:** depois de completar Estúdio UGC · Imagem (em modo mock) e
Cofre de Chaves (Fase 3), o próximo passo natural seria completar o par com
Vídeo (Veo3 via fal.ai). Porém o Rafael não tem, neste momento, uma chave de
API ativa para fal.ai/Veo3.

**Decisão:** pular a Fase 4 · Vídeo por agora e avançar para Fase 6 (Trilhas
e Formações), que não depende de nenhuma chave de API externa — só do banco
de dados já existente e de conteúdo real a ser produzido pelo Rafael.

**Por que não usar modo mock como na imagem:** mock de vídeo teria valor
limitado sem nenhuma chave real para eventualmente validar — diferente da
imagem, onde testar o fluxo de fila/status já trouxe confiança real na
estrutura. Melhor esperar a chave existir para construir e testar de forma
completa numa única rodada.

**Retomar quando:** o Rafael tiver uma chave de API da fal.ai ativa. O
código de Imagem já serve como modelo direto — Vídeo segue a mesma
arquitetura (generations.type = 'video', mesmo padrão de webhook/callback).

---

### #014 — Player de aula genérico via iframe (host de vídeo não decidido)
**Status:** ✅ decidido — 2026-06-23

**Contexto:** ao iniciar a Fase 6 (Trilhas e Formações), foi necessário
decidir como o player de aula vai renderizar `lessons.video_url` sem ainda
ter escolhido definitivamente o host de vídeo (candidato provável: Panda
Video, mas não confirmado).

**Decisão:** construir o player como um `<iframe>` genérico, recebendo
`lessons.video_url` diretamente como `src`, com aspect-ratio 16:9 responsivo.
Não acoplar a nenhum SDK ou script proprietário de provider específico nesta
fase.

**Motivo:** o campo já é texto livre no schema, então qualquer host que
forneça URL de embed (Panda Video, Vimeo, YouTube) funciona sem mudança de
banco. Decidir o host definitivamente pode ser adiado sem bloquear o
progresso da Fase 6 — quando decidido, só ajusta o formato da URL salva no
admin, não a lógica do player.

**Retomar quando:** o host de vídeo for escolhido definitivamente — se o
provider exigir um script JS específico (em vez de simples iframe) para
features como proteção anti-pirataria ou analytics avançado, o player pode
precisar de ajuste nessa hora.

---

### #015 — UX polish pós-teste end-to-end da Fase 6
**Status:** ✅ decidido — 2026-06-23

**Contexto:** após testar Formações/Trilhas/Cursos/Aulas end-to-end via admin, três
problemas de UX foram identificados:

1. **Selects ilegíveis no admin** — `<select>` nativo e `<input>` com autofill do Chrome
   renderizavam com fundo branco (herança do tema claro do navegador), tornando campos
   de "Nível" (Trilhas) e "Tipo" (Cursos) ilegíveis.
2. **Player de vídeo descomunal em widescreen** — `flex-1` do layout absorvia toda a
   largura disponível (~1600px em monitor wide) e o iframe 16:9 acompanhava.
3. **Ícone de imagem quebrada** — quando `cover_url` era válido mas apontava para URL
   inexistente, o `<img>` mostrava o ícone de broken image em vez do fallback.

**Decisões:**
- `color-scheme: dark` no `:root` do `globals.css` — resolve controles nativos de
  forma global; sem isso, qualquer `<select>` ou `<input type="date">` futuro herda tema claro.
- Autofill override via `-webkit-box-shadow: 0 0 0 1000px #0D131F inset` — o Chrome não
  permite sobrescrever a cor de autofill de outra forma.
- Player: `max-w-[880px] mx-auto` no conteúdo da aula + layout responsivo
  `flex-col lg:flex-row` — sidebar empilha abaixo do player em telas estreitas, fica lateral em `lg:`.
- `CoverImage` client component com `onError` que oculta o `<img>` quando falha,
  revelando o gradiente de fundo já presente como placeholder — sem JS extra no bundle
  além do handler inline.

---

### #016 — Guard de assinatura: enforcement no Server Component, não na edge
**Status:** ✅ decidido — 2026-06-24

**Contexto:** DECISIONS.md #001 definiu modelo híbrido leve (cadastro livre, paywall
por assinatura ativa). Na Fase 6 (Parte 1 — sem deploy ainda), foi necessário decidir
onde rodar o gate de acesso.

**Decisão:** o gate de assinatura corre no **Server Component de cada rota gated**
(via `getSubscriptionStatus()` em `utils/subscription.ts`), não no edge middleware.
O `proxy.ts` continua responsável apenas pelo guard de sessão (usuário autenticado).
O helper usa `cache()` do React para deduplica a query DB por request — layout.tsx e
page.tsx chamam a mesma função sem dobrar o custo.

**Rotas gated** (redirect → `/planos` sem assinatura ativa):
- `/galeria`, `/gerador`, `/estudio`, `/formacoes/[slug]/aulas/[lessonId]`

**Rotas vitrine** (qualquer usuário logado):
- `/formacoes`, `/formacoes/[slug]` (currículo como teaser, aulas com cadeado cosmético),
  `/planos`, `/dashboard`, `/favoritos`, `/conexoes`

**Por que não na edge (proxy.ts):** o edge runtime do Next.js não tem acesso ao
cliente Supabase com cookie de sessão de forma confiável para queries de DB — serve
para refresh de token e redirect de sessão, não para lógica de negócio.

**Por que não num layout compartilhado de `(app)`:** um layout único bloquearia vitrine
e admin junto com conteúdo pago — quebraria `/formacoes`, `/planos` e `/admin`.

**Alternativa descartada:** criar um grupo de rotas `(gated)` com layout próprio — mais
elegante em teoria, mas exigiria reestruturar a árvore de arquivos sem benefício real
dado que o número de rotas gated é pequeno e estável.

---

### #017 — Asaas Parte 2: billingType UNDEFINED + CPF/CNPJ inline
**Status:** ✅ decidido — 2026-06-24

**Contexto:** implementação do checkout Asaas e webhook de pagamento (Parte 2 do paywall).
Duas decisões de design do fluxo foram necessárias antes de codificar.

**Decisão 1 — billingType: `UNDEFINED`**
O `POST /subscriptions` no Asaas vai com `billingType: 'UNDEFINED'`. O Asaas exibe
sua própria página de checkout onde o cliente escolhe entre PIX, boleto e cartão de
crédito. Alternativa descartada: `BOLETO` hard-coded — restringiria o método de
pagamento e contradiz a razão original de escolha do Asaas (ver DECISIONS.md #004:
flexibilidade de métodos de pagamento no mercado brasileiro).

**Decisão 2 — CPF/CNPJ inline em /planos (sem schema change)**
O Asaas exige `cpfCnpj` para criação de customer. Opção escolhida: coletar o CPF/CNPJ
no próprio form de checkout em `/planos`, validando apenas o tamanho (11 dígitos = CPF,
14 = CNPJ) antes de chamar a API — sem salvar no nosso DB por ora.
Opção descartada (Opção A): novo campo `profiles.cpf_cnpj` + página `/perfil` — correto
a longo prazo mas requer schema migration + nova tela, sem necessidade para o MVP.
**Retomar quando** `/perfil` for construído: migrar CPF para `profiles` e remover o
campo do form de checkout.

**Nota sobre `externalReference` em webhooks de payment:**
`externalReference = profile_id` é enviado tanto no customer quanto na subscription.
Para eventos de subscription (`SUBSCRIPTION_DELETED`), o campo aparece no objeto
`subscription` do webhook — confiável. Para eventos de payment (`PAYMENT_CONFIRMED`
etc.), confirmado em sandbox (2026-06-24) que `payment.externalReference` **herda**
o valor da subscription — o fallback de lookup por `profile_id` está disponível
também para eventos de payment. O webhook continua usando `payment.subscription` →
`provider_subscription_id` como lookup primário (mais confiável e direto).

---

### #018 — Armadilhas de configuração descobertas durante integração Asaas sandbox
**Status:** ✅ registrado — 2026-06-24

**Contexto:** durante a integração e teste end-to-end do checkout Asaas em sandbox,
duas armadilhas foram encontradas e documentadas para não se repetirem no deploy
de produção.

**Armadilha 1 — Expansão de `$` no `.env.local` pelo dotenv-expand do Next.js**

A chave de API do Asaas começa com `$` (ex: `$aact_hmlg_...` em sandbox). O Next.js
usa `dotenv-expand` ao processar `.env.local`: qualquer valor contendo `$NOME` é
interpretado como expansão de variável de ambiente. Como não existe uma variável
chamada `aact_hmlg_...`, o valor inteiro é silenciosamente substituído por string
vazia — o servidor sobe sem erro, mas todas as chamadas à API retornam
`"ASAAS_API_KEY não configurada"`.

**Solução aplicada:** escapar o `$` inicial com `\` no `.env.local`:
```
ASAAS_API_KEY=\$aact_hmlg_...
```
O `dotenv-expand` resolve `\$` como `$` literal, entregando a chave completa ao
`process.env`. Documentado com aviso visível no `.env.example` e no script de
diagnóstico `scripts/verify-asaas-key.mjs` (usa `@next/env` diretamente,
replicando o mesmo pipeline de carregamento do Next.js para confirmar o valor final
sem precisar subir o servidor).

**Armadilha 2 — URL base do Asaas sandbox: host incorreto**

A URL do sandbox Asaas é `https://api-sandbox.asaas.com/v3` — não
`https://sandbox.asaas.com/api/v3` como documentado informalmente em vários
tutoriais. O host correto é `api-sandbox.asaas.com`, path `/v3/...`. Confirmado
diretamente na spec oficial via MCP de docs do Asaas.

**Confirmação adicional sobre `externalReference` em eventos de payment:**
Confirmado em sandbox (2026-06-24) que `payment.externalReference` herda o
`profile_id` enviado na criação da subscription. O webhook handler já documenta isso
e pode usar este campo como fallback de lookup se `provider_subscription_id` falhar.
Ver também DECISIONS.md #017.
