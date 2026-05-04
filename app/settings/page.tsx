'use client'

import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/components/AuthProvider'

export default function SettingsPage() {
  const { user, loading, signIn, signOut } = useAuth()
  const router = useRouter()

  const kakaoName = user?.user_metadata?.name as string | undefined
  const kakaoEmail = user?.email as string | undefined
  const kakaoAvatar = user?.user_metadata?.avatar_url as string | undefined

  async function handleSignOut() {
    await signOut()
    router.replace('/dashboard')
  }

  return (
    <AppLayout>
      <Page>
        <PageTitle>설정</PageTitle>

        <Section>
          <SectionLabel>계정</SectionLabel>

          {loading ? (
            <PlaceholderCard />
          ) : user ? (
            <AccountCard>
              {kakaoAvatar ? (
                <Avatar src={kakaoAvatar} alt={kakaoName ?? '프로필'} />
              ) : (
                <AvatarFallback>{(kakaoName ?? '?')[0]}</AvatarFallback>
              )}
              <AccountInfo>
                <AccountName>{kakaoName ?? '카카오 사용자'}</AccountName>
                {kakaoEmail && <AccountEmail>{kakaoEmail}</AccountEmail>}
              </AccountInfo>
            </AccountCard>
          ) : (
            <AccountCard $clickable onClick={signIn}>
              <AvatarFallback>?</AvatarFallback>
              <AccountInfo>
                <AccountName>비회원으로 이용 중</AccountName>
                <AccountEmail>카카오로 로그인하면 데이터가 저장됩니다</AccountEmail>
              </AccountInfo>
            </AccountCard>
          )}
        </Section>

        {!loading && (
          <Section>
            {user ? (
              <DangerBtn onClick={handleSignOut}>로그아웃</DangerBtn>
            ) : (
              <PrimaryBtn onClick={signIn}>카카오로 로그인</PrimaryBtn>
            )}
          </Section>
        )}
      </Page>
    </AppLayout>
  )
}

// ─── Styles ───────────────────────────────────────

const Page = styled.div`
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SectionLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const AccountCard = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--bg-muted);
  border-radius: var(--radius-md);
  padding: 16px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`

const PlaceholderCard = styled.div`
  height: 72px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  opacity: 0.5;
`

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
`

const AvatarFallback = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  color: var(--ink-secondary);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

const AccountName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-primary);
`

const AccountEmail = styled.span`
  font-size: 12px;
  color: var(--ink-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PrimaryBtn = styled.button`
  width: 100%;
  height: 48px;
  background: #fee500;
  color: #191919;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.8;
  }
`

const DangerBtn = styled.button`
  width: 100%;
  height: 48px;
  background: none;
  color: var(--ink-tertiary);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--bg-muted);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;

  &:active {
    color: #c0392b;
    border-color: #c0392b;
  }
`
