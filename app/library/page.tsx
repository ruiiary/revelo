'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import { fetchCuratedSentences } from '@/lib/supabase'
import {
  getBooks,
  addBook,
  getPracticeLogs,
  getSentenceCountByBook,
  type Book,
  type Language,
} from '@/lib/storage'

// ─── Types ────────────────────────────────────────

interface ShelfBook {
  id: string
  title: string
  author: string
  language: Language
  practiceCount: number // 필사 횟수 (두께 기준)
  sentenceCount: number // 저장 문장 수
  isLocal: boolean // true = 직접 등록, false = 큐레이션 출처
  color: string
}

// 책 커버 팔레트 (earthy tones)
const BOOK_COLORS: Record<Language, string[]> = {
  en: ['#c8b8a2', '#c8c4a8', '#c8b0a0', '#b8c4c8', '#c4b8c8'],
  ko: ['#a8bcc8', '#b8c8a8', '#c8b8b8', '#a8c8b8', '#b8b8c8'],
}

function pickColor(language: Language, index: number): string {
  const palette = BOOK_COLORS[language]
  return palette[index % palette.length]
}

// ─── Component ────────────────────────────────────

export default function LibraryPage() {
  const [shelfBooks, setShelfBooks] = useState<ShelfBook[]>([])
  const [localBooks, setLocalBooks] = useState<Book[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [lang, setLang] = useState<Language>('ko')
  const [filter, setFilter] = useState<'all' | 'en' | 'ko'>('all')

  useEffect(() => {
    const books = getBooks()
    setLocalBooks(books)

    const sentenceCount = getSentenceCountByBook()
    const logs = getPracticeLogs()

    // 직접 등록한 책 (practice_logs 중 해당 sentence가 로컬 book에 속한 것 집계)
    const localShelf: ShelfBook[] = books.map((book, i) => {
      const count = sentenceCount[book.id] ?? 0
      const practiced = logs.filter((l) => {
        // sentence_id가 이 책 소속인지는 별도 조회 필요 — 근사값으로 sentenceCount 사용
        return false
      }).length
      return {
        id: book.id,
        title: book.title,
        author: book.author,
        language: book.language,
        practiceCount: count,
        sentenceCount: count,
        isLocal: true,
        color: pickColor(book.language, i),
      }
    })

    if (logs.length === 0) {
      setShelfBooks(localShelf)
      return
    }

    const practicedIds = new Set(logs.map((l) => l.sentence_id))

    fetchCuratedSentences().then((curated) => {
      const sourceMap = new Map<string, Omit<ShelfBook, 'color'>>()

      for (const s of curated) {
        if (!practicedIds.has(s.id)) continue
        const key = `${s.source_title}::${s.source_author}`
        const count = logs.filter((l) => l.sentence_id === s.id).length
        const existing = sourceMap.get(key)
        if (existing) {
          existing.practiceCount += count
          existing.sentenceCount += 1
        } else {
          sourceMap.set(key, {
            id: key,
            title: s.source_title,
            author: s.source_author,
            language: s.language,
            practiceCount: count,
            sentenceCount: 1,
            isLocal: false,
          })
        }
      }

      const curatedShelf: ShelfBook[] = Array.from(sourceMap.values()).map((src, i) => ({
        ...src,
        color: pickColor(src.language, i),
      }))

      // 직접 등록 책과 합쳐서 필사 횟수 내림차순 정렬
      const all = [...localShelf, ...curatedShelf].sort((a, b) => b.practiceCount - a.practiceCount)
      setShelfBooks(all)
    })
  }, [])

  function handleAdd() {
    if (!title.trim() || !author.trim()) return
    const book = addBook({ title: title.trim(), author: author.trim(), language: lang })
    setLocalBooks((prev) => [book, ...prev])
    setShelfBooks((prev) => [
      {
        id: book.id,
        title: book.title,
        author: book.author,
        language: book.language,
        practiceCount: 0,
        sentenceCount: 0,
        isLocal: true,
        color: pickColor(book.language, prev.length),
      },
      ...prev,
    ])
    setTitle('')
    setAuthor('')
    setLang('ko')
    setShowForm(false)
  }

  const filteredBooks = shelfBooks.filter((b) => filter === 'all' || b.language === filter)

  // 두께: 필사 횟수 기반 (min 12px, 횟수당 +5px, max 38px)
  const getWidth = (count: number) => Math.min(12 + count * 5, 38)
  // 높이: 필사 횟수 기반 (min 40px, 횟수당 +6px, max 96px)
  const getHeight = (count: number) => Math.min(40 + count * 6, 96)

  return (
    <AppLayout>
      <Page>
        {/* 헤더 */}
        <Header>
          <PageTitle>내 책장</PageTitle>
          <AddButton onClick={() => setShowForm(true)}>
            <Icon name="plus" size={18} />
          </AddButton>
        </Header>

        {/* 필터 탭 */}
        <FilterRow>
          {(['all', 'en', 'ko'] as const).map((f) => (
            <FilterTag key={f} $active={filter === f} onClick={() => setFilter(f)}>
              {f === 'all' ? '전체' : f === 'en' ? '영어' : '한국어'}
            </FilterTag>
          ))}
        </FilterRow>

        {/* 책 등록 폼 */}
        {showForm && (
          <FormCard>
            <FormTitle>책 등록</FormTitle>
            <FormField>
              <Label>책 제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 아몬드"
                autoFocus
              />
            </FormField>
            <FormField>
              <Label>저자</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예) 손원평"
              />
            </FormField>
            <FormField>
              <Label>언어</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    value="ko"
                    checked={lang === 'ko'}
                    onChange={() => setLang('ko')}
                  />
                  한국어
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    value="en"
                    checked={lang === 'en'}
                    onChange={() => setLang('en')}
                  />
                  영어
                </RadioLabel>
              </RadioGroup>
            </FormField>
            <FormActions>
              <CancelButton onClick={() => setShowForm(false)}>취소</CancelButton>
              <SubmitButton onClick={handleAdd} disabled={!title.trim() || !author.trim()}>
                등록
              </SubmitButton>
            </FormActions>
          </FormCard>
        )}

        {/* 빈 상태 */}
        {filteredBooks.length === 0 && !showForm && (
          <EmptyState>
            <Icon name="books" size={36} style={{ color: 'var(--ink-disabled)' }} />
            <EmptyText>아직 쌓인 책이 없어요</EmptyText>
            <EmptyHint>문장을 필사하면 출처 책이 자동으로 책장에 쌓여요</EmptyHint>
          </EmptyState>
        )}

        {filteredBooks.length > 0 && (
          <>
            {/* 시각적 책장 */}
            <ShelfCard>
              <ShelfLabel>책 두께 = 필사 횟수</ShelfLabel>
              <Shelf>
                {filteredBooks.map((book) => (
                  <SpineWrap key={book.id}>
                    <BookRect
                      $width={getWidth(book.practiceCount)}
                      $height={getHeight(book.practiceCount)}
                      $color={book.color}
                    />
                    <SpineTitle>{book.title}</SpineTitle>
                  </SpineWrap>
                ))}
              </Shelf>
            </ShelfCard>

            {/* 책 목록 */}
            <BookCount>{filteredBooks.length}권</BookCount>
            <BookList>
              {filteredBooks.map((book) => {
                const inner = (
                  <>
                    <BookCover $color={book.color} />
                    <BookInfo>
                      <BookTitle>{book.title}</BookTitle>
                      <BookMeta>
                        {book.author} · {book.language === 'ko' ? '한국어' : 'English'}
                      </BookMeta>
                      <BookPracticeCount>
                        {book.practiceCount > 0
                          ? `${book.practiceCount}회 필사했어요`
                          : '아직 필사하지 않았어요'}
                      </BookPracticeCount>
                    </BookInfo>
                    <Icon
                      name="chevron-right"
                      size={14}
                      style={{ color: 'var(--ink-disabled)', flexShrink: 0 }}
                    />
                  </>
                )

                const href = book.isLocal
                  ? `/library/${book.id}`
                  : `/library/source?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`

                return (
                  <BookItemLink key={book.id} href={href}>
                    {inner}
                  </BookItemLink>
                )
              })}
            </BookList>
          </>
        )}
      </Page>
    </AppLayout>
  )
}

// ─── Styles ───────────────────────────────────────

const Page = styled.div`
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const AddButton = styled.button`
  width: 36px;
  height: 36px;
  background: var(--ink-primary);
  color: var(--bg-surface);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-base);

  &:hover {
    opacity: 0.8;
  }
`

const FilterRow = styled.div`
  display: flex;
  gap: 6px;
`

const FilterTag = styled.button<{ $active: boolean }>`
  padding: 5px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  background: ${({ $active }) => ($active ? 'var(--ink-primary)' : 'var(--bg-surface)')};
  color: ${({ $active }) => ($active ? 'var(--bg-surface)' : 'var(--ink-tertiary)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--ink-primary)' : 'var(--bg-muted)')};
  transition: all var(--transition-base);
`

const FormCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--bg-muted);
`

const FormTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-primary);
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-secondary);
`

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--ink-primary);
  outline: none;
  transition: border-color var(--transition-base);

  &::placeholder {
    color: var(--ink-disabled);
  }
  &:focus {
    border-color: var(--accent-sand);
    background: var(--bg-surface);
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ink-primary);
  cursor: pointer;
`

const FormActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const CancelButton = styled.button`
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-secondary);
  background: var(--bg-subtle);
  transition: background var(--transition-base);

  &:hover {
    background: var(--bg-muted);
  }
`

const SubmitButton = styled.button`
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-surface);
  background: var(--ink-primary);
  transition: opacity var(--transition-base);

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
  &:not(:disabled):hover {
    opacity: 0.8;
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 0;
`

const EmptyText = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-tertiary);
`

const EmptyHint = styled.p`
  font-size: 13px;
  color: var(--ink-disabled);
  text-align: center;
  line-height: 1.6;
`

/* ── 시각적 책장 ── */

const ShelfCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px 16px 0;
  border: 1px solid var(--bg-muted);
  overflow-x: auto;
`

const ShelfLabel = styled.p`
  font-size: 10px;
  color: var(--ink-disabled);
  margin-bottom: 12px;
  letter-spacing: 0.04em;
`

const Shelf = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding-bottom: 0;
  border-bottom: 3px solid var(--bg-muted);
  min-height: 108px;
`

const SpineWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
`

const BookRect = styled.div<{ $width: number; $height: number; $color: string }>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  background: ${({ $color }) => $color};
  border-radius: 3px 2px 2px 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.07);
  transition:
    width 0.3s ease,
    height 0.3s ease;
  flex-shrink: 0;
`

const SpineTitle = styled.div`
  font-size: 7px;
  color: var(--ink-tertiary);
  text-align: center;
  width: 36px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

/* ── 책 목록 ── */

const BookCount = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-tertiary);
`

const BookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const bookItemBase = `
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  border: 1px solid var(--bg-muted);
`

const BookItemLink = styled(Link)`
  ${bookItemBase}
  transition: border-color var(--transition-base);
  &:hover {
    border-color: var(--accent-sand);
  }
`

const BookCover = styled.div<{ $color: string }>`
  width: 34px;
  height: 48px;
  background: ${({ $color }) => $color};
  border-radius: 3px 2px 2px 3px;
  border-left: 2px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
`

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

const BookTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BookMeta = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
`

const BookPracticeCount = styled.span`
  font-size: 11px;
  color: var(--ink-disabled);
`
