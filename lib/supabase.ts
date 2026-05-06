import { createClient, type SupabaseClient, type User, type Session } from '@supabase/supabase-js'
import type { Book, Sentence, PracticeLog, Scrap } from './storage'

let _client: SupabaseClient | null = null

export function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase environment variables are not set.')
    _client = createClient(url, key)
  }
  return _client
}

// ─── Types ────────────────────────────────────────

export interface CuratedSentence {
  id: string
  content: string
  source_title: string
  source_author: string
  language: 'en' | 'ko'
  translation: string | null
}

export type { User, Session }

// ─── Auth ─────────────────────────────────────────

export async function signInWithKakao(): Promise<void> {
  await getClient().auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export async function signOut(): Promise<void> {
  await getClient().auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const { data } = await getClient().auth.getSession()
  return data.session
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const { data } = getClient().auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

// ─── Curated Sentence Queries ─────────────────────

export async function fetchCuratedSentences(language?: 'en' | 'ko') {
  let query = getClient()
    .from('sentences')
    .select('id, content, source_title, source_author, language, translation')
    .eq('is_curated', true)

  if (language) {
    query = query.eq('language', language)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CuratedSentence[]
}

export async function fetchSentenceById(id: string): Promise<CuratedSentence | null> {
  const { data, error } = await getClient()
    .from('sentences')
    .select('id, content, source_title, source_author, language, translation')
    .eq('id', id)
    .eq('is_curated', true)
    .single()

  if (error) return null
  return data as CuratedSentence
}

// ─── User Data Sync (로그인 후 마이그레이션에 사용) ─────

export async function syncUserBooks(userId: string, books: Book[]): Promise<void> {
  if (books.length === 0) return
  const { error } = await getClient()
    .from('user_books')
    .upsert(
      books.map((b) => ({ ...b, user_id: userId })),
      { onConflict: 'id' }
    )
  if (error) throw error
}

export async function syncUserSentences(userId: string, sentences: Sentence[]): Promise<void> {
  if (sentences.length === 0) return
  const { error } = await getClient()
    .from('user_sentences')
    .upsert(
      sentences.map((s) => ({ ...s, user_id: userId })),
      { onConflict: 'id' }
    )
  if (error) throw error
}

export async function syncUserPracticeLogs(userId: string, logs: PracticeLog[]): Promise<void> {
  if (logs.length === 0) return
  const { error } = await getClient()
    .from('user_practice_logs')
    .upsert(
      logs.map((l) => ({ ...l, user_id: userId })),
      { onConflict: 'id' }
    )
  if (error) throw error
}

export async function syncUserScraps(userId: string, scraps: Scrap[]): Promise<void> {
  if (scraps.length === 0) return
  const { error } = await getClient()
    .from('user_scraps')
    .upsert(
      scraps.map((s) => ({ ...s, user_id: userId })),
      { onConflict: 'id' }
    )
  if (error) throw error
}

// ─── User Data Fetch (기기 간 동기화에 사용) ──────

export async function fetchUserBooks(userId: string): Promise<Book[]> {
  const { data, error } = await getClient()
    .from('user_books')
    .select('id, title, author, language, created_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as Book[]
}

export async function fetchUserSentences(userId: string): Promise<Sentence[]> {
  const { data, error } = await getClient()
    .from('user_sentences')
    .select('id, book_id, content, page, language, is_curated, created_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as Sentence[]
}

export async function fetchUserPracticeLogs(userId: string): Promise<PracticeLog[]> {
  const { data, error } = await getClient()
    .from('user_practice_logs')
    .select('id, sentence_id, user_input, is_correct, practiced_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as PracticeLog[]
}

export async function fetchUserScraps(userId: string): Promise<Scrap[]> {
  const { data, error } = await getClient()
    .from('user_scraps')
    .select('id, sentence_id, collection_name, created_at')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as Scrap[]
}
