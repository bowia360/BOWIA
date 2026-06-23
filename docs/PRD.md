# PRD — BOW Creator

> **Status:** Fase 0 — Fundação
> **Última atualização:** 2026-06-23
> **Owner:** Rafael Gullo Mendes (BOW 360 Digital)
> **Nome do produto:** BOW Creator
> **Domínio:** bowcreator.com.br (domínio próprio, não subdomínio — ver DECISIONS.md #008)

## 1. O que é

BOW Creator é a plataforma de membros da BOW 360. Diferente de um curso comum, o
Creator entrega **conteúdo + ferramentas que geram asset real** (prompt, imagem, vídeo
UGC). O aluno não só assiste — ele produz dentro da própria plataforma.

**Tese central:** "IA é ferramenta, o valor está na aplicação" (do material BOW 360
sobre Geração Automática de Vídeos UGC) — o Creator é essa frase virada produto.

## 2. Por que existe (problema → solução)

| Problema | Como o Creator resolve |
|---|---|
| Curso comum não gera recorrência — aluno assiste e esquece | Ferramentas nativas (galeria, gerador de prompt, Estúdio UGC) dão motivo pra voltar toda semana |
| Conteúdo de IA fica abstrato sem prática guiada | Trilhas terminam em "Projeto" — o aluno usa a ferramenta de verdade, não só vê o professor usar |
| BOW 360 vende workshop pontual, sem upsell recorrente | Creator vira order bump / combo no funil do workshop, sobe ticket e LTV sem CAC novo |

## 3. Módulos do produto

### 3.1 Aprender
- **Formações → Trilhas → Cursos → Aulas** (hierarquia de 4 níveis, ver DATABASE.md)
- Progresso por aula (% assistido + concluído), progresso agregado por trilha
- "Projeto" vinculado ao fim de uma trilha (pode apontar para uma `generation` real do Estúdio UGC)

### 3.2 Produzir
- **Galeria de prompts** — grid filtrável por categoria, modal com preview + copiar + favoritar
- **Gerador de prompt** — descrição em linguagem natural → prompt pronto via LLM (GPT/Gemini/Claude)
- **Estúdio UGC · Imagem** — geração via fal.ai (Nano Banana)
- **Estúdio UGC · Vídeo** — geração via fal.ai (Veo3), com fila assíncrona + callback (não polling)
- Histórico pessoal de gerações (galeria "Meus vídeos/imagens")

### 3.3 Conta
- Perfil (nome, avatar, ocupação) — modelo de referência: tela "Configurações" do Prompts IA
- **Conexões / Cofre de chaves** — BYOK opcional (fal.ai, OpenAI, Gemini, Claude), sempre criptografado, nunca exposto no client
- Gamificação leve: streak de dias, XP/pontos (inspirado na ASIMOV)

## 4. Formações de topo (v1)

1. **RevOps & Automação com IA** — n8n do zero, Supabase para automações, arquitetura de agentes, integrações de API (UAZAPI/WhatsApp/CRM), Z-PRO/Tickebot na prática
2. **Agentes de IA para Atendimento e Vendas** — chatbot WhatsApp com RAG, qualificação de leads, multiagente, CRM/Pipeline
3. **Tráfego Pago & Performance** — Meta Ads, Google Ads, métricas, copy de anúncio com IA, landing pages
4. **Conteúdo & Autoridade com IA** — LinkedIn de autoridade, carrosséis, prompt engineering pra marketing, storytelling
5. **UGC Factory — Vídeos e Imagens com IA** ⭐ — fundamentos de prompt visual, geração de imagem, geração de vídeo, projeto final = gerar o próprio anúncio (ponte direta com o Estúdio UGC)

> Lista é ponto de partida, não definitiva. Revisar em ROADMAP.md conforme conteúdo for produzido.

## 5. Monetização

1. **Assinatura recorrente** (mensal/anual) — motor de MRR, dá acesso às Formações + galeria + gerador de prompt
2. **Combo com workshop** — Creator como order bump na oferta do BOW Innovation Works
3. **Packs de crédito UGC** — consumo de vídeo/imagem, margem alta, escala por uso

**Modelo de consumo do Estúdio UGC:** ainda em decisão de negócio (ver DECISIONS.md #003).
Schema modela os dois caminhos possíveis (crédito avulso vs. cota de plano) via `credit_ledger` —
decisão de produto não trava engenharia.

**BYOK vs. crédito gerenciado:** híbrido. Trilha leve liberada na assinatura; UGC pesado
por crédito. Avançado pode plugar a própria chave (fal.ai/OpenAI/Gemini/Claude) e economizar crédito.

## 6. Cadastro

**Decisão fechada (DECISIONS.md #001):** híbrido leve. Cadastro livre e imediato
— qualquer pessoa cria conta sem pagar nada antes. Conteúdo de valor (Trilhas,
Galeria completa, Estúdio UGC) fica atrás de paywall checado em tempo real
contra `subscriptions.status = 'active'`. Vitrine (catálogo de Formações,
landing de planos) acessível a qualquer usuário autenticado, mesmo sem assinatura.

## 7. Fora de escopo (v1)

- Processamento em lote de vídeos via planilha (mencionado como "extensão futura" no
  material de referência — não é v1)
- Geração via WhatsApp (mesma lógica — é v2)
- Migração de chaves para o formato novo `sb_publishable_/sb_secret_` do Supabase
  (mantemos legacy JWT por agora, ver DECISIONS.md #002)

## 8. Referências usadas no design do produto

- `bowia.com.br` — design system oficial (grid + glass + glow azul neon)
- Plataforma "Prompts IA" (anovaera) — referência funcional de galeria/perfil/tutoriais
- Plataforma "Agentes IA 2.0" — referência de organização por trilhas com fases
- Plataforma ASIMOV — referência de hierarquia Formação→Trilha→Curso→Aula, gamificação,
  progresso por aula, projetos vinculados a trilha
- PDF "Trilha Agentes IA para Marketing — Geração Automática de Vídeos UGC com IA" —
  blueprint técnico original do motor UGC (n8n + fal.ai + Lovable + Gmail)
