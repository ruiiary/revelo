-- Revelo DB Schema
-- Phase 1 기반. Phase 6에서 user_id FK 추가 예정.

-- ─── books ───────────────────────────────────────
create table if not exists books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  language    text not null check (language in ('en', 'ko')),
  created_at  timestamptz not null default now()
);

-- ─── sentences ───────────────────────────────────
create table if not exists sentences (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid references books(id) on delete set null,
  content      text not null,
  page         int,
  language     text not null check (language in ('en', 'ko')),
  is_curated   boolean not null default false,
  source_title text,        -- 큐레이션 문장의 출처 책 제목
  source_author text,       -- 큐레이션 문장의 저자
  translation  text,        -- 영어 문장의 한국어 번역 (en only)
  created_at   timestamptz not null default now()
);

create index if not exists sentences_book_id_idx on sentences(book_id);
create index if not exists sentences_language_idx on sentences(language);
create index if not exists sentences_is_curated_idx on sentences(is_curated);

-- ─── practice_logs ───────────────────────────────
create table if not exists practice_logs (
  id            uuid primary key default gen_random_uuid(),
  sentence_id   uuid not null references sentences(id) on delete cascade,
  user_input    text not null,
  is_correct    boolean not null,
  practiced_at  timestamptz not null default now()
);

create index if not exists practice_logs_sentence_id_idx on practice_logs(sentence_id);
create index if not exists practice_logs_practiced_at_idx on practice_logs(practiced_at desc);

-- ─── scraps ──────────────────────────────────────
create table if not exists scraps (
  id               uuid primary key default gen_random_uuid(),
  sentence_id      uuid not null references sentences(id) on delete cascade,
  collection_name  text,
  created_at       timestamptz not null default now(),
  unique (sentence_id)
);

-- ─── RLS (Row Level Security) ────────────────────
-- 비회원 모드: anon 사용자가 curated sentences를 읽을 수 있도록 허용
alter table sentences enable row level security;

create policy "anon can read curated sentences"
  on sentences for select
  to anon
  using (is_curated = true);

create policy "authenticated can read curated sentences"
  on sentences for select
  to authenticated
  using (is_curated = true);
