-- ============================================================
-- Revelo — 유저 데이터 테이블 (Phase 6)
-- Supabase SQL Editor 에서 실행하세요.
-- ============================================================

-- 유저가 직접 등록한 책
CREATE TABLE IF NOT EXISTS user_books (
  id          uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  author      text        NOT NULL DEFAULT '',
  language    text        NOT NULL DEFAULT 'en',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 유저가 직접 입력한 문장 (is_curated=false)
CREATE TABLE IF NOT EXISTS user_sentences (
  id          uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id     uuid        REFERENCES user_books(id) ON DELETE SET NULL,
  content     text        NOT NULL,
  page        integer,
  language    text        NOT NULL DEFAULT 'en',
  is_curated  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 필사 기록 (큐레이션 + 직접 입력 문장 모두)
CREATE TABLE IF NOT EXISTS user_practice_logs (
  id           uuid        PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sentence_id  text        NOT NULL, -- curated sentences.id 또는 user_sentences.id
  user_input   text        NOT NULL,
  is_correct   boolean     NOT NULL DEFAULT false,
  practiced_at timestamptz NOT NULL DEFAULT now()
);

-- 스크랩
CREATE TABLE IF NOT EXISTS user_scraps (
  id               uuid        PRIMARY KEY,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sentence_id      text        NOT NULL,
  collection_name  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sentence_id)
);

-- ─── Row Level Security ────────────────────────────────────

ALTER TABLE user_books          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sentences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scraps         ENABLE ROW LEVEL SECURITY;

-- 각 유저는 자신의 데이터만 접근 가능
CREATE POLICY "own books"         ON user_books          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own sentences"     ON user_sentences      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own practice_logs" ON user_practice_logs  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own scraps"        ON user_scraps         FOR ALL USING (auth.uid() = user_id);
