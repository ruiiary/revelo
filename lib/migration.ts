import { getBooks, getSentences, getPracticeLogs, getScraps } from './storage'
import { syncUserBooks, syncUserSentences, syncUserPracticeLogs, syncUserScraps } from './supabase'

const MIGRATION_KEY = 'revelo_migrated'

function isMigrated(userId: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    const record = JSON.parse(localStorage.getItem(MIGRATION_KEY) ?? '{}')
    return !!record[userId]
  } catch {
    return false
  }
}

function markMigrated(userId: string): void {
  if (typeof window === 'undefined') return
  try {
    const record = JSON.parse(localStorage.getItem(MIGRATION_KEY) ?? '{}')
    record[userId] = true
    localStorage.setItem(MIGRATION_KEY, JSON.stringify(record))
  } catch {
    // ignore
  }
}

/**
 * 첫 로그인 시 localStorage 데이터를 Supabase로 동기화한다.
 * 이미 마이그레이션한 유저는 건너뛴다.
 */
export async function migrateToSupabase(userId: string): Promise<void> {
  if (isMigrated(userId)) return

  const [books, sentences, logs, scraps] = [
    getBooks(),
    getSentences(),
    getPracticeLogs(),
    getScraps(),
  ]

  await Promise.all([
    syncUserBooks(userId, books),
    syncUserSentences(userId, sentences),
    syncUserPracticeLogs(userId, logs),
    syncUserScraps(userId, scraps),
  ])

  markMigrated(userId)
}
