'use client'

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import SentenceCard from '@/components/ui/SentenceCard'
import { fetchCuratedSentences, type CuratedSentence } from '@/lib/supabase'
import { getLanguage, getStreak, getTotalStats, type Language } from '@/lib/storage'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const LANG_LABEL: Record<Language, string> = {
  en: '영어 필사',
  ko: '한국어 독서 필사',
}

export default function DashboardPage() {
  const [sentences, setSentences] = useState<CuratedSentence[]>([])
  const [language, setLanguage] = useState<Language | null>(null)
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState({ totalSessions: 0, totalWords: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const lang = getLanguage()
    const currentStreak = getStreak()
    setLanguage(lang)
    setStreak(currentStreak)
    setStats(getTotalStats())

    fetchCuratedSentences(lang ?? undefined)
      .then(setSentences)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const todayDay = today.getDay()

  // 이번 주 월~일 7칸 (오늘 기준)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - todayDay + i)
    return d
  })

  const featured = sentences[0]
  const rest = sentences.slice(1)

  return (
    <AppLayout>
      <Page>
        {/* 헤더 */}
        <Header>
          <Logo>R</Logo>
          <DateText>
            {today.getMonth() + 1}월 {today.getDate()}일 {DAYS[todayDay]}요일
          </DateText>
        </Header>

        {/* 스트릭 */}
        <StreakSection>
          <StreakTop>
            <StreakLabel>연속 필사</StreakLabel>
            <StreakCount>
              <StreakNum>{streak}</StreakNum>일째
            </StreakCount>
          </StreakTop>
          <WeekRow>
            {weekDays.map((d, i) => {
              const isToday = i === todayDay
              return (
                <DayCol key={i}>
                  <DayLabel $today={isToday}>{DAYS[d.getDay()]}</DayLabel>
                  <DayDot $today={isToday} $done={i < todayDay || (i === todayDay && streak > 0)} />
                </DayCol>
              )
            })}
          </WeekRow>
        </StreakSection>

        {/* 통계 */}
        <StatsRow>
          <StatCard>
            <StatNum>{stats.totalSessions}</StatNum>
            <StatLabel>총 필사 횟수</StatLabel>
          </StatCard>
          <StatDivider />
          <StatCard>
            <StatNum>{stats.totalWords.toLocaleString()}</StatNum>
            <StatLabel>총 단어 수</StatLabel>
          </StatCard>
        </StatsRow>

        {/* 큐레이션 */}
        <Section>
          <SectionHeader>
            <SectionTitle>오늘의 큐레이션</SectionTitle>
            {language && <LangBadge>{LANG_LABEL[language]}</LangBadge>}
          </SectionHeader>

          {loading && <EmptyMsg>불러오는 중...</EmptyMsg>}
          {error && <EmptyMsg>문장을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</EmptyMsg>}

          {!loading && !error && sentences.length === 0 && (
            <EmptyMsg>
              {language
                ? '아직 큐레이션 문장이 없어요.'
                : '필사 탭에서 언어를 선택하면 맞춤 문장을 보여드려요.'}
            </EmptyMsg>
          )}

          {!loading && !error && featured && (
            <CardList>
              <SentenceCard sentence={featured} featured />
              {rest.map((s) => (
                <SentenceCard key={s.id} sentence={s} />
              ))}
            </CardList>
          )}
        </Section>
      </Page>
    </AppLayout>
  )
}

// ─── Styles ───────────────────────────────────────

const Page = styled.div`
  padding: 20px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Logo = styled.div`
  width: 34px;
  height: 34px;
  background: var(--ink-primary);
  color: var(--bg-surface);
  font-family: var(--font-sentence);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
`

const DateText = styled.span`
  font-size: 13px;
  color: var(--ink-tertiary);
`

const StreakSection = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--bg-muted);
`

const StreakTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`

const StreakLabel = styled.span`
  font-size: 12px;
  color: var(--ink-tertiary);
  font-weight: 500;
`

const StreakCount = styled.div`
  font-size: 13px;
  color: var(--ink-secondary);
`

const StreakNum = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--ink-primary);
  margin-right: 2px;
`

const WeekRow = styled.div`
  display: flex;
  justify-content: space-between;
`

const DayCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
`

const DayLabel = styled.span<{ $today: boolean }>`
  font-size: 10px;
  color: ${({ $today }) => ($today ? 'var(--ink-primary)' : 'var(--ink-disabled)')};
  font-weight: ${({ $today }) => ($today ? 700 : 400)};
`

const DayDot = styled.div<{ $today: boolean; $done: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: ${({ $done, $today }) =>
    $done ? 'var(--accent-sand)' : $today ? 'var(--bg-subtle)' : 'var(--bg-muted)'};
  border: ${({ $today }) => ($today ? '2px solid var(--accent-sand)' : '2px solid transparent')};
`

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--bg-muted);
  overflow: hidden;
`

const StatCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 12px;
`

const StatNum = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const StatLabel = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
  font-weight: 500;
`

const StatDivider = styled.div`
  width: 1px;
  height: 36px;
  background: var(--bg-muted);
  flex-shrink: 0;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.01em;
`

const LangBadge = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-tertiary);
  background: var(--bg-subtle);
  padding: 3px 8px;
  border-radius: var(--radius-full);
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const EmptyMsg = styled.p`
  font-size: 14px;
  color: var(--ink-tertiary);
  text-align: center;
  padding: 32px 0;
  line-height: 1.6;
`
