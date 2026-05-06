import { getBooks, getSentences, getPracticeLogs, getScraps } from './storage'
import type { Book, Sentence, PracticeLog, Scrap } from './storage'
import {
  syncUserBooks,
  syncUserSentences,
  syncUserPracticeLogs,
  syncUserScraps,
  fetchUserBooks,
  fetchUserSentences,
  fetchUserPracticeLogs,
  fetchUserScraps,
} from './supabase'

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

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of local) map.set(item.id, item)
  for (const item of remote) map.set(item.id, item) // DB가 source of truth
  return Array.from(map.values())
}

function writeLocal(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

/**
 * 로그인 시마다 Supabase 데이터를 localStorage에 병합한다.
 * 기기 간 통계 동기화를 위해 migration 이후 항상 실행된다.
 */
export async function hydrateFromSupabase(userId: string): Promise<void> {
  const [remoteBooks, remoteSentences, remoteLogs, remoteScraps] = await Promise.all([
    fetchUserBooks(userId),
    fetchUserSentences(userId),
    fetchUserPracticeLogs(userId),
    fetchUserScraps(userId),
  ])

  writeLocal('revelo_books', mergeById<Book>(getBooks(), remoteBooks))
  writeLocal('revelo_sentences', mergeById<Sentence>(getSentences(), remoteSentences))
  writeLocal('revelo_practice_logs', mergeById<PracticeLog>(getPracticeLogs(), remoteLogs))
  writeLocal('revelo_scraps', mergeById<Scrap>(getScraps(), remoteScraps))
}
