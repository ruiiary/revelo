'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import { getScraps, removeScrap, getSentenceById } from '@/lib/storage'
import { fetchCuratedSentences, type CuratedSentence } from '@/lib/supabase'

interface ScrapItem {
  scrapId: string
  sentenceId: string
  content: string
  sourceTitle: string
  sourceAuthor: string
  isLocal: boolean
}

export default function ScrapsPage() {
  const [items, setItems] = useState<ScrapItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const scraps = getScraps()

    if (scraps.length === 0) {
      setLoading(false)
      return
    }

    const scrapMap = new Map(scraps.map((s) => [s.sentence_id, s.id]))

    fetchCuratedSentences().then((curated) => {
      const curatedMap = new Map<string, CuratedSentence>(curated.map((s) => [s.id, s]))
      const result: ScrapItem[] = []

      for (const [sentenceId, scrapId] of scrapMap) {
        const curated = curatedMap.get(sentenceId)
        if (curated) {
          result.push({
            scrapId,
            sentenceId,
            content: curated.content,
            sourceTitle: curated.source_title,
            sourceAuthor: curated.source_author,
            isLocal: false,
          })
          continue
        }
        const local = getSentenceById(sentenceId)
        if (local) {
          result.push({
            scrapId,
            sentenceId,
            content: local.content,
            sourceTitle: '',
            sourceAuthor: '',
            isLocal: true,
          })
        }
      }

      setItems(result)
      setLoading(false)
    })
  }, [])

  function handleRemove(scrapId: string, sentenceId: string) {
    removeScrap(sentenceId)
    setItems((prev) => prev.filter((i) => i.scrapId !== scrapId))
  }

  return (
    <AppLayout>
      <Page>
        <Header>
          <PageTitle>스크랩</PageTitle>
          {items.length > 0 && <ItemCount>{items.length}문장</ItemCount>}
        </Header>

        {loading && <StatusText>불러오는 중...</StatusText>}

        {!loading && items.length === 0 && (
          <EmptyState>
            <Icon name="bookmark" size={36} style={{ color: 'var(--ink-disabled)' }} />
            <EmptyText>스크랩한 문장이 없어요</EmptyText>
            <EmptyHint>필사하다 마음에 드는 문장을 저장해 보세요</EmptyHint>
          </EmptyState>
        )}

        {!loading && items.length > 0 && (
          <ItemList>
            {items.map((item) => (
              <Item key={item.scrapId}>
                <ItemTop>
                  <ItemQuote>&ldquo;{item.content}&rdquo;</ItemQuote>
                  <RemoveButton onClick={() => handleRemove(item.scrapId, item.sentenceId)}>
                    <Icon name="bookmark" size={18} />
                  </RemoveButton>
                </ItemTop>
                {(item.sourceTitle || item.sourceAuthor) && (
                  <ItemSource>
                    {[item.sourceAuthor, item.sourceTitle].filter(Boolean).join(' · ')}
                  </ItemSource>
                )}
                <PracticeLink
                  href={`/practice?sentenceId=${item.sentenceId}${item.isLocal ? '&local=true' : ''}`}
                >
                  필사하기
                </PracticeLink>
              </Item>
            ))}
          </ItemList>
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
  align-items: baseline;
  justify-content: space-between;
`

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const ItemCount = styled.span`
  font-size: 13px;
  color: var(--ink-tertiary);
  font-weight: 500;
`

const StatusText = styled.p`
  font-size: 14px;
  color: var(--ink-tertiary);
  text-align: center;
  padding: 48px 0;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 0;
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

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Item = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--bg-muted);
`

const ItemTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`

const ItemQuote = styled.p`
  font-family: var(--font-sentence);
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-primary);
  word-break: keep-all;
  flex: 1;
`

const RemoveButton = styled.button`
  color: var(--accent-sand);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 2px;
`

const ItemSource = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
`

const PracticeLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  align-self: flex-end;
  cursor: pointer;
`
