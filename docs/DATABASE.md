# Database — BOW Creator

> **Projeto Supabase:** `studiobowia` (ref `oqfyuigdhdpnvlprqdvj`, região `sa-east-1`)
> **Conta:** `bowia360@gmail.com` — separada da conta pessoal do Rafael
> Este SQL deve ser colado e revisado manualmente no **SQL Editor** do painel Supabase
> antes de rodar — nenhum agente deve executar isso direto em produção sem o Rafael
> ver o conteúdo primeiro (regra herdada: "show me before applying").

## Visão geral do schema

```
FORMATIONS ──┐
             ├──► TRACKS ──► COURSES ──► LESSONS ──► LESSON_PROGRESS ◄── PROFILES
             │                  │
             │                  └──► GENERATIONS (projeto vinculado, opcional)
             │
PROFILES ──┬─── SUBSCRIPTIONS ◄── PLANS
           ├─── CREDIT_LEDGER ◄── (triggered by) GENERATIONS
           ├─── GENERATIONS
           ├─── PROMPT_FAVORITES ◄── PROMPTS
           └─── API_CONNECTIONS
```

**Por que `credit_ledger` é um livro-caixa, não um saldo:** toda entrada/saída de
crédito é uma linha imutável (delta positivo ou negativo + motivo). Isso permite
modelar tanto **crédito avulso** (delta negativo por geração) quanto **cota de
plano** (delta positivo recorrente mensal vindo de `subscriptions`) sem mudar a
estrutura — a decisão de negócio (DECISIONS.md #003) fica isolada na camada de
regra de aplicação, não na tabela.

## SQL completo

```sql
-- ============================================================
-- BOW IA STUDIO — SCHEMA INICIAL (Fase 0)
-- Rodar no SQL Editor do projeto "studiobowia" (renomear para refletir BOW Creator quando possível)
-- ============================================================

-- extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- PROFILES (estende auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  occupation text,
  role text not null default 'student' check (role in ('student','admin')),
  streak_days int not null default 0,
  xp_points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trigger: cria profile automaticamente quando um usuário se cadastra no auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- CONTEÚDO: FORMATIONS → TRACKS → COURSES → LESSONS
-- ─────────────────────────────────────────────
create table public.formations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_url text,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid not null references public.formations(id) on delete cascade,
  title text not null,
  slug text not null,
  level text check (level in ('basico','intermediario','avancado')),
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (formation_id, slug)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  slug text not null,
  type text not null default 'curso' check (type in ('curso','projeto')),
  instructor_name text,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (track_id, slug)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  video_url text,
  duration_seconds int,
  order_index int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

-- ─────────────────────────────────────────────
-- MONETIZAÇÃO: PLANS, SUBSCRIPTIONS, CREDIT_LEDGER
-- ─────────────────────────────────────────────
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_brl numeric(10,2) not null default 0,
  monthly_image_quota int,   -- null = ilimitado ou não aplicável (decisão de negócio futura)
  monthly_video_quota int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active' check (status in ('active','past_due','canceled','trialing')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  provider text,             -- 'stripe' | 'asaas' | etc — decisão pendente (DECISIONS.md)
  provider_subscription_id text,
  created_at timestamptz not null default now()
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,        -- positivo = crédito ganho, negativo = consumido
  reason text not null,      -- 'purchase' | 'plan_renewal' | 'generation_image' | 'generation_video' | 'admin_grant'
  generation_id uuid,        -- referência opcional, FK adicionada depois de generations existir
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- ESTÚDIO UGC: GENERATIONS
-- ─────────────────────────────────────────────
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,  -- vínculo opcional com "Projeto" de trilha
  type text not null check (type in ('image','video')),
  status text not null default 'queued'
    check (status in ('queued','generating_image','generating_video','done','failed')),
  provider text not null default 'fal.ai',
  input_prompt text,
  input_image_url text,
  output_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.credit_ledger
  add constraint credit_ledger_generation_fk
  foreign key (generation_id) references public.generations(id) on delete set null;

-- ─────────────────────────────────────────────
-- GALERIA DE PROMPTS
-- ─────────────────────────────────────────────
create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  prompt_text text not null,
  preview_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.prompt_favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, prompt_id)
);

-- ─────────────────────────────────────────────
-- COFRE DE CHAVES (BYOK)
-- ─────────────────────────────────────────────
create table public.api_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('fal_ai','openai','gemini','claude')),
  encrypted_key text not null,   -- nunca texto puro — criptografar antes de inserir
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, provider)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — habilitar em TODAS as tabelas
-- ============================================================

alter table public.profiles enable row level security;
alter table public.formations enable row level security;
alter table public.tracks enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.generations enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_favorites enable row level security;
alter table public.api_connections enable row level security;

-- PROFILES: cada um vê e edita só o próprio perfil
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- CONTEÚDO PUBLICADO: qualquer usuário autenticado pode ler conteúdo publicado
create policy "formations_select_published" on public.formations for select using (is_published = true);
create policy "tracks_select_published" on public.tracks for select using (is_published = true);
create policy "courses_select_published" on public.courses for select using (is_published = true);
create policy "lessons_select_published" on public.lessons for select using (is_published = true);

-- LESSON_PROGRESS: cada um vê/edita só o próprio progresso
create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = profile_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = profile_id);
create policy "lesson_progress_update_own" on public.lesson_progress for update using (auth.uid() = profile_id);

-- PLANS: leitura pública (vitrine de preços)
create policy "plans_select_active" on public.plans for select using (is_active = true);

-- SUBSCRIPTIONS: cada um vê só a própria assinatura
create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = profile_id);

-- CREDIT_LEDGER: cada um vê só o próprio extrato
create policy "credit_ledger_select_own" on public.credit_ledger for select using (auth.uid() = profile_id);

-- GENERATIONS: cada um vê/cria só as próprias gerações
create policy "generations_select_own" on public.generations for select using (auth.uid() = profile_id);
create policy "generations_insert_own" on public.generations for insert with check (auth.uid() = profile_id);

-- PROMPTS: leitura pública (galeria é vitrine)
create policy "prompts_select_published" on public.prompts for select using (is_published = true);

-- PROMPT_FAVORITES: cada um vê/gerencia só os próprios favoritos
create policy "prompt_favorites_select_own" on public.prompt_favorites for select using (auth.uid() = profile_id);
create policy "prompt_favorites_insert_own" on public.prompt_favorites for insert with check (auth.uid() = profile_id);
create policy "prompt_favorites_delete_own" on public.prompt_favorites for delete using (auth.uid() = profile_id);

-- API_CONNECTIONS: cada um vê/gerencia só as próprias chaves
create policy "api_connections_select_own" on public.api_connections for select using (auth.uid() = profile_id);
create policy "api_connections_insert_own" on public.api_connections for insert with check (auth.uid() = profile_id);
create policy "api_connections_update_own" on public.api_connections for update using (auth.uid() = profile_id);
create policy "api_connections_delete_own" on public.api_connections for delete using (auth.uid() = profile_id);

-- NOTA: escrita em formations/tracks/courses/lessons/plans/prompts fica restrita
-- a service_role (admin) — não há policy de insert/update/delete para usuários
-- comuns nessas tabelas de conteúdo. Gestão de conteúdo via painel admin futuro
-- ou direto via service_role no backend.
```

## Checklist pós-execução

Depois de rodar o SQL acima no painel:

1. Confirmar com `Supabase:get_advisors (type: security)` que não sobrou nenhuma
   tabela sem RLS habilitado
2. Testar o trigger `handle_new_user` criando um usuário de teste via Auth e
   confirmando que a linha em `profiles` aparece automaticamente
3. **Girar a `service_role key`** que foi exposta em chat — `Project Settings →
   API Keys → Secret keys → gerar nova` — e atualizar o `.env` local
