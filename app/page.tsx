'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, getScraps } from '@/lib/storage'

const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2C5.582 2 2 4.836 2 8.32c0 2.18 1.376 4.1 3.46 5.253l-.882 3.276a.25.25 0 0 0 .376.27L9.1 14.6A9.7 9.7 0 0 0 10 14.64c4.418 0 8-2.836 8-6.32S14.418 2 10 2Z"
      fill="currentColor"
    />
  </svg>
)

export default function LandingPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const [hasLocalData, setHasLocalData] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
      return
    }
    // 기존 비회원 데이터 여부 확인
    const hasPractice = getPracticeLogs().length > 0
    const hasScraps = getScraps().length > 0
    setHasLocalData(hasPractice || hasScraps)
  }, [user, loading, router])

  async function handleKakaoLogin() {
    setSigningIn(true)
    await signIn()
  }

  function handleGuest() {
    router.push('/dashboard')
  }

  if (loading || (!loading && user)) return null

  return (
    <Page>
      <Top>
        <Logo>R</Logo>
        <AppName>Revelo</AppName>
        <Tagline>읽고, 덮고, 써보는{'\n'}필사 기반 언어 학습</Tagline>
      </Top>

      <Bottom>
        {hasLocalData && (
          <MigrationNotice>
            저장된 필사 기록이 있어요.
            <br />
            카카오로 로그인하면 데이터가 계정에 안전하게 백업됩니다.
          </MigrationNotice>
        )}

        <KakaoBtn onClick={handleKakaoLogin} disabled={signingIn}>
          <KakaoIcon />
          {signingIn ? '이동 중...' : '카카오로 로그인'}
        </KakaoBtn>

        <GuestBtn onClick={handleGuest}>
          {hasLocalData ? '비회원으로 계속 이용하기' : '비회원으로 시작하기'}
        </GuestBtn>
      </Bottom>
    </Page>
  )
}

// ─── Styles ───────────────────────────────────────

const Page = styled.div`
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 80px 32px 56px;
`

const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  background: var(--ink-primary);
  color: var(--bg-surface);
  font-family: var(--font-sentence);
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
`

const AppName = styled.h1`
  font-family: var(--font-sentence);
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const Tagline = styled.p`
  font-size: 15px;
  color: var(--ink-secondary);
  line-height: 1.7;
  white-space: pre-line;
`

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const MigrationNotice = styled.p`
  font-size: 13px;
  color: var(--ink-secondary);
  line-height: 1.65;
  background: var(--bg-surface);
  border: 1px solid var(--bg-muted);
  border-left: 3px solid var(--accent-sand);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
`

const KakaoBtn = styled.button`
  width: 100%;
  height: 52px;
  background: #fee500;
  color: #191919;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const GuestBtn = styled.button`
  width: 100%;
  height: 48px;
  background: none;
  color: var(--ink-tertiary);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--bg-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color 0.15s;

  &:active {
    color: var(--ink-primary);
  }
`
