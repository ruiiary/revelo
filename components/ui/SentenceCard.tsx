'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import Icon from '@/components/ui/Icon'
import { addScrap, removeScrap, isScrapped } from '@/lib/storage'
import type { CuratedSentence } from '@/lib/supabase'

interface SentenceCardProps {
  sentence: CuratedSentence
  featured?: boolean
}

export default function SentenceCard({ sentence, featured = false }: SentenceCardProps) {
  const practiceHref = `/practice?sentenceId=${sentence.id}`
  const [scrapped, setScrapped] = useState(false)

  useEffect(() => {
    setScrapped(isScrapped(sentence.id))
  }, [sentence.id])

  function handleScrap(e: React.MouseEvent) {
    e.preventDefault()
    if (scrapped) {
      removeScrap(sentence.id)
      setScrapped(false)
    } else {
      addScrap(sentence.id)
      setScrapped(true)
    }
  }

  if (featured) {
    return (
      <FeaturedCard>
        <FeaturedTop>
          <FeaturedTag>오늘의 추천</FeaturedTag>
          <ScrapButton onClick={handleScrap} $scrapped={scrapped} $dark>
            <Icon name="bookmark" size={18} />
          </ScrapButton>
        </FeaturedTop>
        <FeaturedQuote>&ldquo;{sentence.content}&rdquo;</FeaturedQuote>
        <FeaturedMeta>
          <FeaturedBook>{sentence.source_title}</FeaturedBook>
          <FeaturedAuthor>{sentence.source_author}</FeaturedAuthor>
        </FeaturedMeta>
        <PracticeButton href={practiceHref}>필사 시작</PracticeButton>
      </FeaturedCard>
    )
  }

  return (
    <RegularCard>
      <CardQuote>&ldquo;{sentence.content}&rdquo;</CardQuote>
      <CardFooter>
        <CardMeta>
          <CardBook>{sentence.source_title}</CardBook>
          <CardAuthor>{sentence.source_author}</CardAuthor>
        </CardMeta>
        <CardActions>
          <ScrapButton onClick={handleScrap} $scrapped={scrapped} $dark={false}>
            <Icon name="bookmark" size={16} />
          </ScrapButton>
          <CardAction href={practiceHref}>필사</CardAction>
        </CardActions>
      </CardFooter>
    </RegularCard>
  )
}

// ─── Featured ─────────────────────────────────────

const FeaturedCard = styled.div`
  background: var(--ink-primary);
  color: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FeaturedTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const FeaturedTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-sand);
`

const FeaturedQuote = styled.p`
  font-family: var(--font-sentence);
  font-size: 17px;
  line-height: 1.7;
  color: var(--bg-surface);
  word-break: keep-all;
`

const FeaturedMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const FeaturedBook = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`

const FeaturedAuthor = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
`

const PracticeButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-sand);
  color: var(--ink-primary);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  align-self: flex-start;
  transition: opacity var(--transition-base);

  &:hover {
    opacity: 0.85;
  }
`

// ─── Regular ──────────────────────────────────────

const RegularCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--bg-muted);
`

const CardQuote = styled.p`
  font-family: var(--font-sentence);
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-primary);
  word-break: keep-all;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardFooter = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
`

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const CardBook = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
`

const CardAuthor = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-secondary);
`

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`

const ScrapButton = styled.button<{ $scrapped: boolean; $dark: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $scrapped, $dark }) =>
    $scrapped ? 'var(--accent-sand)' : $dark ? 'rgba(255,255,255,0.4)' : 'var(--ink-disabled)'};
  transition: color var(--transition-base);

  svg {
    fill: ${({ $scrapped }) => ($scrapped ? 'var(--accent-sand)' : 'none')};
    transition: fill var(--transition-base);
  }

  &:hover {
    color: var(--accent-sand);
  }
`

const CardAction = styled(Link)`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  white-space: nowrap;
  transition: opacity var(--transition-base);

  &:hover {
    opacity: 0.7;
  }
`
