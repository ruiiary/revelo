// ─── Types ────────────────────────────────────────

export type Language = 'en' | 'ko'

export interface Book {
  id: string
  title: string
  author: string
  language: Language
  created_at: string
}

export interface Sentence {
  id: string
  book_id: string | null
  content: string
  page: number | null
  language: Language
  is_curated: boolean
  created_at: string
}

export interface PracticeLog {
  id: string
  sentence_id: string
  user_input: string
  is_correct: boolean
  practiced_at: string
}

export interface Scrap {
  id: string
  sentence_id: string
  collection_name: string | null
  created_at: string
}

// ─── Keys ─────────────────────────────────────────

const KEYS = {
  language: 'revelo_language',
  books: 'revelo_books',
  sentences: 'revelo_sentences',
  practiceLogs: 'revelo_practice_logs',
  scraps: 'revelo_scraps',
} as const

// ─── Helpers ──────────────────────────────────────

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function generateId(): string {
  return crypto.randomUUID()
}

// ─── Language ─────────────────────────────────────

export function getLanguage(): Language | null {
  return read<Language>(KEYS.language)
}

export function setLanguage(lang: Language): void {
  write(KEYS.language, lang)
}

// ─── Books ────────────────────────────────────────

export function getBooks(): Book[] {
  return read<Book[]>(KEYS.books) ?? []
}

export function addBook(data: Omit<Book, 'id' | 'created_at'>): Book {
  const books = getBooks()
  const book: Book = { ...data, id: generateId(), created_at: new Date().toISOString() }
  write(KEYS.books, [...books, book])
  return book
}

export function deleteBook(id: string): void {
  write(
    KEYS.books,
    getBooks().filter((b) => b.id !== id)
  )
}

// ─── Sentences ────────────────────────────────────

export function getSentences(): Sentence[] {
  return read<Sentence[]>(KEYS.sentences) ?? []
}

export function getSentenceById(id: string): Sentence | undefined {
  return getSentences().find((s) => s.id === id)
}

export function getSentencesByBook(bookId: string): Sentence[] {
  return getSentences().filter((s) => s.book_id === bookId)
}

export function addSentence(data: Omit<Sentence, 'id' | 'created_at'>): Sentence {
  const sentences = getSentences()
  const sentence: Sentence = { ...data, id: generateId(), created_at: new Date().toISOString() }
  write(KEYS.sentences, [...sentences, sentence])
  return sentence
}

export function deleteSentence(id: string): void {
  write(
    KEYS.sentences,
    getSentences().filter((s) => s.id !== id)
  )
}

// ─── Practice Logs ────────────────────────────────

export function getPracticeLogs(): PracticeLog[] {
  return read<PracticeLog[]>(KEYS.practiceLogs) ?? []
}

export function addPracticeLog(data: Omit<PracticeLog, 'id' | 'practiced_at'>): PracticeLog {
  const logs = getPracticeLogs()
  const log: PracticeLog = {
    ...data,
    id: generateId(),
    practiced_at: new Date().toISOString(),
  }
  write(KEYS.practiceLogs, [...logs, log])
  return log
}

export function getWrongLogs(): PracticeLog[] {
  return getPracticeLogs().filter((l) => !l.is_correct)
}

/** 연속 필사 일수 (streak) 계산 */
export function getStreak(): number {
  const logs = getPracticeLogs()
  if (logs.length === 0) return 0

  const dates = Array.from(new Set(logs.map((l) => l.practiced_at.slice(0, 10)))).sort((a, b) =>
    b.localeCompare(a)
  )

  const today = new Date().toISOString().slice(0, 10)
  if (dates[0] !== today) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

/** 누적 통계: 총 필사 횟수, 총 단어 수 */
export function getTotalStats(): { totalSessions: number; totalWords: number } {
  const logs = getPracticeLogs()
  const totalSessions = logs.length
  const totalWords = logs.reduce((sum, log) => {
    return sum + log.user_input.trim().split(/\s+/).filter(Boolean).length
  }, 0)
  return { totalSessions, totalWords }
}

/** 책별 저장된 문장 수 맵 */
export function getSentenceCountByBook(): Record<string, number> {
  const sentences = getSentences()
  const map: Record<string, number> = {}
  for (const s of sentences) {
    if (s.book_id) {
      map[s.book_id] = (map[s.book_id] ?? 0) + 1
    }
  }
  return map
}

// ─── Scraps ───────────────────────────────────────

export function getScraps(): Scrap[] {
  return read<Scrap[]>(KEYS.scraps) ?? []
}

export function addScrap(sentence_id: string, collection_name?: string): Scrap {
  const scraps = getScraps()
  const scrap: Scrap = {
    id: generateId(),
    sentence_id,
    collection_name: collection_name ?? null,
    created_at: new Date().toISOString(),
  }
  write(KEYS.scraps, [...scraps, scrap])
  return scrap
}

export function removeScrap(sentence_id: string): void {
  write(
    KEYS.scraps,
    getScraps().filter((s) => s.sentence_id !== sentence_id)
  )
}

export function isScrapped(sentence_id: string): boolean {
  return getScraps().some((s) => s.sentence_id === sentence_id)
}
