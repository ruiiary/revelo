'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styled from 'styled-components'
import Icon from '@/components/ui/Icon'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'home', label: '홈' },
  { href: '/practice', icon: 'pen', label: '필사' },
  { href: '/library', icon: 'books', label: '책장' },
  { href: '/notebook', icon: 'note', label: '노트' },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <Nav>
      {NAV_ITEMS.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <NavItem key={href} href={href} $active={active}>
            <Icon name={icon} size={22} />
            <NavLabel>{label}</NavLabel>
          </NavItem>
        )
      })}
    </Nav>
  )
}

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 64px;
  background: var(--bg-surface);
  border-top: 1px solid var(--bg-muted);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 100;
`

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 16px;
  color: ${({ $active }) => ($active ? 'var(--ink-primary)' : 'var(--ink-tertiary)')};
  transition: color var(--transition-base);

  &:hover {
    color: var(--ink-secondary);
  }
`

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
`
