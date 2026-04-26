'use client'

import styled from 'styled-components'
import BottomNav from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode
  hideNav?: boolean
}

export default function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  return (
    <Wrapper>
      <Main $hasNav={!hideNav}>{children}</Main>
      {!hideNav && <BottomNav />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg-base);
`

const Main = styled.main<{ $hasNav: boolean }>`
  flex: 1;
  padding-bottom: ${({ $hasNav }) => ($hasNav ? '64px' : '0')};
  overflow-y: auto;
`
