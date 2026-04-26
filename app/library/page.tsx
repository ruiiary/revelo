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

interface PracticedSource {
  key: string
  title: string
  author: string
  language: Language
  practiceCount: number
}

// ─── Component ────────────────────────────────────

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [sentenceCount, setSentenceCount] = useState<Record<string, number>>({})
  const [practicedSources, setPracticedSources] = useState<PracticedSource[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [lang, setLang] = useState<Language>('ko')

  useEffect(() => {
    setBooks(getBooks())
    setSentenceCount(getSentenceCountByBook())

    // 필사한 큐레이션 문장 출처 집계
    const logs = getPracticeLogs()
    if (logs.length === 0) return

    const practicedIds = new Set(logs.map((l) => l.sentence_id))

    fetchCuratedSentences().then((curated) => {
      const sourceMap = new Map<string, PracticedSource>()

      for (const s of curated) {
        if (!practicedIds.has(s.id)) continue
        const key = `${s.source_title}::${s.source_author}`
        const count = logs.filter((l) => l.sentence_id === s.id).length
        const existing = sourceMap.get(key)
        if (existing) {
          existing.practiceCount += count
        } else {
          sourceMap.set(key, {
            key,
            title: s.source_title,
            author: s.source_author,
            language: s.language,
            practiceCount: count,
          })
        }
      }

      setPracticedSources(Array.from(sourceMap.values()))
    })
  }, [])

  function handleAdd() {
    if (!title.trim() || !author.trim()) return
    const book = addBook({ title: title.trim(), author: author.trim(), language: lang })
    setBooks((prev) => [book, ...prev])
    setTitle('')
    setAuthor('')
    setLang('ko')
    setShowForm(false)
  }

  const isEmpty = books.length === 0 && practicedSources.length === 0

  return (
    <AppLayout>
      <Page>
        <Header>
          <PageTitle>내 책장</PageTitle>
          <AddButton onClick={() => setShowForm(true)}>
            <Icon name="plus" size={18} />
          </AddButton>
        </Header>

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

        {isEmpty && !showForm && (
          <EmptyState>
            <Icon name="books" size={36} style={{ color: 'var(--ink-disabled)' }} />
            <EmptyText>아직 쌓인 책이 없어요</EmptyText>
            <EmptyHint>문장을 필사하면 출처 책이 자동으로 쌓여요</EmptyHint>
          </EmptyState>
        )}

        {/* 필사한 큐레이션 출처 */}
        {practicedSources.length > 0 && (
          <Section>
            <SectionTitle>필사한 문장 출처</SectionTitle>
            <BookList>
              {practicedSources.map((src) => {
                const spineHeight = Math.min(32 + src.practiceCount * 10, 88)
                return (
                  <CuratedBookItem key={src.key}>
                    <BookSpineWrap>
                      <BookSpine $language={src.language} $height={spineHeight} />
                    </BookSpineWrap>
                    <BookInfo>
                      <BookTitleRow>
                        <BookTitle>{src.title}</BookTitle>
                        <CuratedBadge>큐레이션</CuratedBadge>
                      </BookTitleRow>
                      <BookAuthor>{src.author}</BookAuthor>
                      <BookSentenceCount>{src.practiceCount}회 필사</BookSentenceCount>
                    </BookInfo>
                    <LangTag>{src.language === 'ko' ? '한국어' : 'English'}</LangTag>
                  </CuratedBookItem>
                )
              })}
            </BookList>
          </Section>
        )}

        {/* 직접 등록한 책 */}
        {books.length > 0 && (
          <Section>
            <SectionTitle>내가 등록한 책</SectionTitle>
            <BookList>
              {books.map((book) => {
                const count = sentenceCount[book.id] ?? 0
                const spineHeight = Math.min(32 + count * 8, 88)
                return (
                  <BookItem key={book.id} href={`/library/${book.id}`}>
                    <BookSpineWrap>
                      <BookSpine $language={book.language} $height={spineHeight} />
                    </BookSpineWrap>
                    <BookInfo>
                      <BookTitle>{book.title}</BookTitle>
                      <BookAuthor>{book.author}</BookAuthor>
                      <BookSentenceCount>
                        {count > 0 ? `${count}문장` : '문장 없음'}
                      </BookSentenceCount>
                    </BookInfo>
                    <LangTag>{book.language === 'ko' ? '한국어' : 'English'}</LangTag>
                    <Icon name="chevron-right" size={16} style={{ color: 'var(--ink-disabled)' }} />
                  </BookItem>
                )
              })}
            </BookList>
          </Section>
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
  gap: 20px;
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

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-tertiary);
  letter-spacing: 0.04em;
`

const BookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const BookItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  border: 1px solid var(--bg-muted);
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--accent-sand);
  }
`

const CuratedBookItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  border: 1px solid var(--bg-muted);
`

const BookSpineWrap = styled.div`
  width: 14px;
  height: 88px;
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
`

const BookSpine = styled.div<{ $language: Language; $height: number }>`
  width: 6px;
  height: ${({ $height }) => $height}px;
  border-radius: 3px;
  background: ${({ $language }) =>
    $language === 'ko' ? 'var(--accent-sage)' : 'var(--accent-sand)'};
  transition: height 0.3s ease;
`

const BookInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

const BookTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const BookTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CuratedBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-sand);
  background: rgba(201, 169, 110, 0.12);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
`

const BookAuthor = styled.span`
  font-size: 12px;
  color: var(--ink-tertiary);
`

const BookSentenceCount = styled.span`
  font-size: 11px;
  color: var(--ink-disabled);
  margin-top: 2px;
`

const LangTag = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
  white-space: nowrap;
`
