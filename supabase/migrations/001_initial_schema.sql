-- ═══════════════════════════════════════════════════════════════
--  Speech Analytics — Schema completo
--  Ejecuta esto en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ─── Tabla: recordings ───────────────────────────────────────────
create table if not exists public.recordings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  filename      text not null,
  storage_path  text not null,
  duration_sec  integer,
  agent_name    text,
  status        text not null default 'pending'
                check (status in ('pending', 'processing', 'done', 'error')),
  error_msg     text,
  created_at    timestamptz not null default now()
);

-- ─── Tabla: analysis ─────────────────────────────────────────────
create table if not exists public.analysis (
  id              uuid primary key default uuid_generate_v4(),
  recording_id    uuid references public.recordings(id) on delete cascade not null unique,

  -- Transcripción
  transcript      jsonb,           -- [{speaker, text, start_sec, end_sec}]

  -- Sentimiento
  sentiment_pos   numeric(5,2),
  sentiment_neu   numeric(5,2),
  sentiment_neg   numeric(5,2),

  -- Scores 0-100
  score_satisfaction  integer,
  score_clarity       integer,
  score_empathy       integer,
  score_resolution    integer,
  score_compliance    integer,

  -- Keywords y temas
  keywords        text[],
  topics          text[],

  -- Métricas de conversación
  talk_ratio_agent   numeric(5,2),
  talk_ratio_client  numeric(5,2),
  interruptions      integer default 0,
  long_silences      integer default 0,

  -- Alertas detectadas
  alerts          text[],

  -- NPS estimado
  nps_score       integer,

  -- Cumplimiento de script (JSON: {item: bool})
  compliance_items jsonb,

  created_at      timestamptz not null default now()
);

-- ─── Row Level Security ──────────────────────────────────────────
alter table public.recordings enable row level security;
alter table public.analysis   enable row level security;

-- Usuarios solo ven sus propios datos
create policy "recordings: owner access"
  on public.recordings for all
  using (auth.uid() = user_id);

create policy "analysis: owner access via recording"
  on public.analysis for all
  using (
    exists (
      select 1 from public.recordings r
      where r.id = analysis.recording_id
        and r.user_id = auth.uid()
    )
  );

-- ─── Storage bucket ──────────────────────────────────────────────
-- Ejecuta esto en Storage → Buckets → New bucket:
--   Nombre: recordings
--   Private: true (NO público)
--
-- Luego en SQL Editor:
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict do nothing;

create policy "recordings bucket: owner access"
  on storage.objects for all
  using (
    bucket_id = 'recordings'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── Índices ──────────────────────────────────────────────────────
create index if not exists recordings_user_id_idx on public.recordings(user_id);
create index if not exists recordings_status_idx  on public.recordings(status);
create index if not exists analysis_recording_idx on public.analysis(recording_id);
