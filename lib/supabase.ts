import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
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

// ─── Queries ──────────────────────────────────────

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
