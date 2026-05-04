'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import {
  getWrongLogs,
  getSentenceById,
  getScraps,
  removeScrap,
  type PracticeLog,
} from '@/lib/storage'
import { fetchCuratedSentences, type CuratedSentence } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

// ─── Types ────────────────────────────────────────

type Tab = 'scraps' | 'notebook'

interface WrongItem {
  log: PracticeLog
  content: string
  sourceTitle: string
  sourceAuthor: string
  isLocal: boolean
}

interface ScrapItem {
  scrapId: string
  sentenceId: string
  content: string
  sourceTitle: string
  sourceAuthor: string
  isLocal: boolean
}

// ─── Component ────────────────────────────────────

const KakaoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2C5.582 2 2 4.836 2 8.32c0 2.18 1.376 4.1 3.46 5.253l-.882 3.276a.25.25 0 0 0 .376.27L9.1 14.6A9.7 9.7 0 0 0 10 14.64c4.418 0 8-2.836 8-6.32S14.418 2 10 2Z"
      fill="currentColor"
    />
  </svg>
)

export default function NotebookPage() {
  const { user, signIn } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [tab, setTab] = useState<Tab>('scraps')
  const [wrongItems, setWrongItems] = useState<WrongItem[]>([])
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([])
  const [loading, setLoading] = useState(true)

  async function handleKakaoLogin() {
    setSigningIn(true)
    await signIn()
  }

  useEffect(() => {
    const scraps = getScraps().sort((a, b) => b.created_at.localeCompare(a.created_at))
    const wrongLogs = getWrongLogs()

    if (scraps.length === 0 && wrongLogs.length === 0) {
      setLoading(false)
      return
    }

    fetchCuratedSentences().then((curated) => {
      const curatedMap = new Map<string, CuratedSentence>(curated.map((s) => [s.id, s]))

      // 스크랩
      const scrapResult: ScrapItem[] = scraps.flatMap((scrap): ScrapItem[] => {
        const c = curatedMap.get(scrap.sentence_id)
        if (c)
          return [
            {
              scrapId: scrap.id,
              sentenceId: scrap.sentence_id,
              content: c.content,
              sourceTitle: c.source_title,
              sourceAuthor: c.source_author,
              isLocal: false,
            },
          ]
        const local = getSentenceById(scrap.sentence_id)
        if (local)
          return [
            {
              scrapId: scrap.id,
              sentenceId: scrap.sentence_id,
              content: local.content,
              sourceTitle: '',
              sourceAuthor: '',
              isLocal: true,
            },
          ]
        return []
      })
      setScrapItems(scrapResult)

      // 오답노트 — sentence_id 기준 중복 제거 (최신 1건)
      const deduped = new Map<string, PracticeLog>()
      for (const log of [...wrongLogs].sort((a, b) =>
        b.practiced_at.localeCompare(a.practiced_at)
      )) {
        if (!deduped.has(log.sentence_id)) deduped.set(log.sentence_id, log)
      }
      const wrongResult: WrongItem[] = Array.from(deduped.values()).flatMap((log): WrongItem[] => {
        const c = curatedMap.get(log.sentence_id)
        if (c)
          return [
            {
              log,
              content: c.content,
              sourceTitle: c.source_title,
              sourceAuthor: c.source_author,
              isLocal: false,
            },
          ]
        const local = getSentenceById(log.sentence_id)
        if (local)
          return [{ log, content: local.content, sourceTitle: '', sourceAuthor: '', isLocal: true }]
        return []
      })
      setWrongItems(wrongResult)

      setLoading(false)
    })
  }, [])

  function handleRemoveScrap(scrapId: string, sentenceId: string) {
    removeScrap(sentenceId)
    setScrapItems((prev) => prev.filter((i) => i.scrapId !== scrapId))
  }

  return (
    <AppLayout>
      <Page>
        <PageTitle>노트</PageTitle>

        {/* 탭 */}
        <TabRow>
          <TabBtn $active={tab === 'scraps'} onClick={() => setTab('scraps')}>
            <Icon name="bookmark" size={14} />
            스크랩
            {scrapItems.length > 0 && <TabCount>{scrapItems.length}</TabCount>}
          </TabBtn>
          <TabBtn $active={tab === 'notebook'} onClick={() => setTab('notebook')}>
            <Icon name="note" size={14} />
            오답 노트
            {wrongItems.length > 0 && <TabCount>{wrongItems.length}</TabCount>}
          </TabBtn>
        </TabRow>

        {/* 비로그인 유저 카카오 연동 배너 */}
        {!user && (
          <LoginBanner>
            <LoginBannerText>
              <LoginBannerTitle>기록을 안전하게 보관하세요</LoginBannerTitle>
              <LoginBannerDesc>
                카카오로 로그인하면 필사 기록과 스크랩이 계정에 백업됩니다
              </LoginBannerDesc>
            </LoginBannerText>
            <LoginBannerBtn onClick={handleKakaoLogin} disabled={signingIn}>
              <KakaoIcon />
              {signingIn ? '이동 중...' : '로그인'}
            </LoginBannerBtn>
          </LoginBanner>
        )}

        {loading && <StatusText>불러오는 중...</StatusText>}

        {/* ── 스크랩 탭 ── */}
        {!loading && tab === 'scraps' && (
          <>
            {scrapItems.length === 0 ? (
              <EmptyState>
                <Icon name="bookmark" size={36} style={{ color: 'var(--ink-disabled)' }} />
                <EmptyText>스크랩한 문장이 없어요</EmptyText>
                <EmptyHint>필사하다 마음에 드는 문장을 저장해 보세요</EmptyHint>
              </EmptyState>
            ) : (
              <ItemList>
                {scrapItems.map((item) => (
                  <ScrapCard key={item.scrapId}>
                    <ScrapTop>
                      <ItemQuote>&ldquo;{item.content}&rdquo;</ItemQuote>
                      <RemoveBtn onClick={() => handleRemoveScrap(item.scrapId, item.sentenceId)}>
                        <Icon name="bookmark" size={18} />
                      </RemoveBtn>
                    </ScrapTop>
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
                  </ScrapCard>
                ))}
              </ItemList>
            )}
          </>
        )}

        {/* ── 오답 노트 탭 ── */}
        {!loading && tab === 'notebook' && (
          <>
            {wrongItems.length === 0 ? (
              <EmptyState>
                <EmptyIcon>✓</EmptyIcon>
                <EmptyText>틀린 문장이 없어요</EmptyText>
                <EmptyHint>필사하다 틀린 문장이 여기에 자동으로 모여요</EmptyHint>
              </EmptyState>
            ) : (
              <ItemList>
                {wrongItems.map(({ log, content, sourceTitle, sourceAuthor, isLocal }) => (
                  <WrongCard key={log.id}>
                    <ItemQuote>&ldquo;{content}&rdquo;</ItemQuote>
                    {(sourceTitle || sourceAuthor) && (
                      <ItemSource>
                        {[sourceAuthor, sourceTitle].filter(Boolean).join(' · ')}
                      </ItemSource>
                    )}
                    <ItemFooter>
                      <UserInput>&ldquo;{log.user_input}&rdquo;</UserInput>
                      <RetryLink
                        href={`/practice?sentenceId=${log.sentence_id}${isLocal ? '&local=true' : ''}`}
                      >
                        다시 필사
                      </RetryLink>
                    </ItemFooter>
                  </WrongCard>
                ))}
              </ItemList>
            )}
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
  gap: 20px;
`

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const TabRow = styled.div`
  display: flex;
  gap: 8px;
`

const TabBtn = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  background: ${({ $active }) => ($active ? 'var(--ink-primary)' : 'var(--bg-surface)')};
  color: ${({ $active }) => ($active ? 'var(--bg-surface)' : 'var(--ink-tertiary)')};
  border: 1px solid ${({ $active }) => ($active ? 'var(--ink-primary)' : 'var(--bg-muted)')};
  transition: all var(--transition-base);
`

const TabCount = styled.span`
  font-size: 11px;
  font-weight: 700;
  background: var(--accent-sand);
  color: var(--ink-primary);
  border-radius: var(--radius-full);
  padding: 1px 6px;
  line-height: 1.4;
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

const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(90, 143, 106, 0.12);
  color: var(--state-success);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const ItemQuote = styled.p`
  font-family: var(--font-sentence);
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-primary);
  word-break: keep-all;
  flex: 1;
`

const ItemSource = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
`

const ScrapCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--bg-muted);
`

const ScrapTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`

const RemoveBtn = styled.button`
  color: var(--accent-sand);
  flex-shrink: 0;
  padding: 2px;

  svg {
    fill: var(--accent-sand);
  }
`

const PracticeLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  align-self: flex-end;
  cursor: pointer;
`

const WrongCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--bg-muted);
  border-left: 3px solid var(--state-error);
`

const ItemFooter = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`

const UserInput = styled.p`
  font-family: var(--font-sentence);
  font-size: 13px;
  line-height: 1.6;
  color: var(--state-error);
  opacity: 0.7;
  flex: 1;
  word-break: keep-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const RetryLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
`

const LoginBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--bg-muted);
  border-left: 3px solid var(--accent-sand);
  border-radius: var(--radius-md);
  padding: 14px 16px;
`

const LoginBannerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
`

const LoginBannerTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-primary);
`

const LoginBannerDesc = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
  line-height: 1.5;
`

const LoginBannerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  background: #fee500;
  color: #191919;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
