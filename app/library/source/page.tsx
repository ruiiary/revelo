'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import { fetchCuratedSentences, type CuratedSentence } from '@/lib/supabase'
import { getPracticeLogs } from '@/lib/storage'

interface PracticedSentence {
  sentence: CuratedSentence
  practiceCount: number
  lastPracticed: string
}

function SourceDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const title = searchParams.get('title') ?? ''
  const author = searchParams.get('author') ?? ''

  const [items, setItems] = useState<PracticedSentence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const logs = getPracticeLogs()
    const logMap = new Map<string, { count: number; last: string }>()
    for (const log of logs) {
      const existing = logMap.get(log.sentence_id)
      if (!existing || log.practiced_at > existing.last) {
        logMap.set(log.sentence_id, {
          count: (existing?.count ?? 0) + (existing ? 0 : 0),
          last: log.practiced_at,
        })
      }
    }
    // 횟수 재집계
    for (const log of logs) {
      const entry = logMap.get(log.sentence_id)
      if (entry) entry.count = logs.filter((l) => l.sentence_id === log.sentence_id).length
    }

    fetchCuratedSentences()
      .then((curated) => {
        const matched: PracticedSentence[] = []
        for (const s of curated) {
          if (s.source_title !== title || s.source_author !== author) continue
          const entry = logMap.get(s.id)
          if (!entry) continue
          matched.push({ sentence: s, practiceCount: entry.count, lastPracticed: entry.last })
        }
        matched.sort((a, b) => b.lastPracticed.localeCompare(a.lastPracticed))
        setItems(matched)
      })
      .finally(() => setLoading(false))
  }, [title, author])

  return (
    <AppLayout>
      <Page>
        <Header>
          <BackButton onClick={() => router.back()}>
            <Icon name="chevron-left" size={20} />
          </BackButton>
          <HeaderCenter>
            <BookTitle>{title}</BookTitle>
            <BookAuthor>{author}</BookAuthor>
          </HeaderCenter>
        </Header>

        {loading && <StatusText>불러오는 중...</StatusText>}

        {!loading && items.length === 0 && <StatusText>필사한 문장이 없어요.</StatusText>}

        {!loading && items.length > 0 && (
          <>
            <SentenceCount>{items.length}문장 필사했어요</SentenceCount>
            <SentenceList>
              {items.map(({ sentence, practiceCount }) => (
                <SentenceItem key={sentence.id}>
                  <SentenceText>&ldquo;{sentence.content}&rdquo;</SentenceText>
                  <SentenceMeta>
                    <PracticeCountBadge>{practiceCount}회 필사</PracticeCountBadge>
                    <PracticeLink href={`/practice?sentenceId=${sentence.id}`}>
                      다시 필사
                    </PracticeLink>
                  </SentenceMeta>
                </SentenceItem>
              ))}
            </SentenceList>
          </>
        )}
      </Page>
    </AppLayout>
  )
}

export default function SourceDetailPage() {
  return (
    <Suspense>
      <SourceDetailContent />
    </Suspense>
  )
}

// ─── Styles ───────────────────────────────────────

const Page = styled.div`
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button`
  color: var(--ink-secondary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const HeaderCenter = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const BookTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  color: var(--ink-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const BookAuthor = styled.span`
  font-size: 12px;
  color: var(--ink-tertiary);
`

const StatusText = styled.p`
  font-size: 14px;
  color: var(--ink-tertiary);
  padding: 32px 0;
  text-align: center;
`

const SentenceCount = styled.p`
  font-size: 13px;
  color: var(--ink-tertiary);
  font-weight: 500;
`

const SentenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SentenceItem = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--bg-muted);
`

const SentenceText = styled.p`
  font-family: var(--font-sentence);
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-primary);
  word-break: keep-all;
`

const SentenceMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-tertiary);
`

const PracticeCountBadge = styled.span`
  font-size: 11px;
  color: var(--ink-disabled);
`

const PracticeLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  cursor: pointer;
`
