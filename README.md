# BOW Creator

Plataforma de membros da BOW 360 — trilhas de formação + ferramentas nativas de
geração de imagem/vídeo UGC com IA. Não é "mais um curso": é o ambiente de
trabalho onde o aluno aprende e produz no mesmo lugar.

**Domínio:** bowcreator.com.br (ver DECISIONS.md #008 — domínio próprio, não
subdomínio, para permitir venda independente do workshop no futuro)

## Como navegar esta documentação

Leia nesta ordem se for sua primeira vez no projeto:

1. **[`docs/PRD.md`](docs/PRD.md)** — o que é, módulos, formações de topo, modelo de monetização
2. **[`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md)** — tokens visuais reais (fonte: CSS de bowia.com.br)
3. **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** — stack, infraestrutura, fluxo de dados do Estúdio UGC
4. **[`docs/DATABASE.md`](docs/DATABASE.md)** — schema completo + SQL pronto com RLS
5. **[`docs/API-INTEGRATIONS.md`](docs/API-INTEGRATIONS.md)** — contratos de chamada (fal.ai, OpenAI, Gemini, Claude, n8n)
6. **[`docs/ROADMAP.md`](docs/ROADMAP.md)** — fases do projeto, status, próximos passos
7. **[`docs/DECISIONS.md`](docs/DECISIONS.md)** — log de decisões e por que foram tomadas (ler antes de questionar uma escolha já feita)

## Stack

Next.js · Supabase (projeto `studiobowia`) · n8n (`automacoes.bow360.cloud`) ·
fal.ai (Nano Banana / Veo3) · OpenAI / Gemini / Claude · Coolify (deploy)

## Convenções importantes (não pular)

- **Nunca chutar token visual.** Sempre checar `docs/DESIGN-SYSTEM.md` ou a skill
  `.claude/skills/bow-design-system/SKILL.md` antes de estilizar algo.
- **Mostrar evidência antes de aplicar** mudanças em schema/produção (regra
  herdada de outros projetos do Rafael).
- **Sempre GET antes de PUT** em qualquer workflow n8n.
- **Nunca commitar `.env.local`** ou colar `service_role key`/segredos em texto puro.
- Repositório nesta conta: `bowia360` (separada da conta pessoal/org `BOW360`).

## Status atual

Fase 0 — Fundação, em andamento. Ver `docs/ROADMAP.md` para checklist detalhado.
