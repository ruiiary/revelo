'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import { getBooks, getSentencesByBook, addSentence, type Book, type Sentence } from '@/lib/storage'

interface Props {
  params: Promise<{ bookId: string }>
}

export default function BookDetailPage({ params }: Props) {
  const { bookId } = use(params)
  const router = useRouter()

  const [book, setBook] = useState<Book | null>(null)
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState('')
  const [page, setPage] = useState('')

  useEffect(() => {
    const found = getBooks().find((b) => b.id === bookId) ?? null
    setBook(found)
    setSentences(getSentencesByBook(bookId))
  }, [bookId])

  function handleAdd() {
    if (!content.trim() || !book) return
    const s = addSentence({
      book_id: bookId,
      content: content.trim(),
      page: page ? Number(page) : null,
      language: book.language,
      is_curated: false,
    })
    setSentences((prev) => [s, ...prev])
    setContent('')
    setPage('')
    setShowForm(false)
  }

  if (!book) {
    return (
      <AppLayout>
        <div style={{ padding: '24px 20px', color: 'var(--ink-tertiary)' }}>
          책을 찾을 수 없어요.
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Page>
        {/* 헤더 */}
        <Header>
          <BackButton onClick={() => router.back()}>
            <Icon name="chevron-left" size={20} />
          </BackButton>
          <HeaderCenter>
            <BookTitle>{book.title}</BookTitle>
            <BookAuthor>{book.author}</BookAuthor>
          </HeaderCenter>
          <AddButton onClick={() => setShowForm(true)}>
            <Icon name="plus" size={18} />
          </AddButton>
        </Header>

        {/* 문장 입력 폼 */}
        {showForm && (
          <FormCard>
            <FormTitle>문장 추가</FormTitle>
            <FormField>
              <Label>문장</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="필사할 문장을 입력하세요"
                rows={4}
                autoFocus
              />
            </FormField>
            <FormField>
              <Label>페이지 (선택)</Label>
              <Input
                type="number"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="예) 42"
                min={1}
              />
            </FormField>
            <FormActions>
              <CancelButton onClick={() => setShowForm(false)}>취소</CancelButton>
              <SubmitButton onClick={handleAdd} disabled={!content.trim()}>
                담기
              </SubmitButton>
            </FormActions>
          </FormCard>
        )}

        {/* 문장 목록 */}
        <SentenceCount>
          {sentences.length > 0 ? `${sentences.length}문장 쌓았어요` : '아직 문장이 없어요'}
        </SentenceCount>

        {sentences.length === 0 && !showForm && (
          <EmptyState>
            <Icon name="pen" size={32} style={{ color: 'var(--ink-disabled)' }} />
            <EmptyText>+ 버튼을 눌러 문장을 담아보세요</EmptyText>
          </EmptyState>
        )}

        <SentenceList>
          {sentences.map((s) => (
            <SentenceItem key={s.id}>
              <SentenceText>&ldquo;{s.content}&rdquo;</SentenceText>
              <SentenceMeta>
                {s.page ? `p.${s.page}` : ''}
                <PracticeLink href={`/practice?sentenceId=${s.id}&local=true`}>필사</PracticeLink>
              </SentenceMeta>
            </SentenceItem>
          ))}
        </SentenceList>
      </Page>
    </AppLayout>
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

const AddButton = styled.button`
  width: 34px;
  height: 34px;
  background: var(--ink-primary);
  color: var(--bg-surface);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const FormCard = styled.div`
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--bg-muted);
`

const FormTitle = styled.h2`
  font-size: 14px;
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

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--font-sentence);
  color: var(--ink-primary);
  outline: none;
  resize: vertical;
  line-height: 1.7;
  transition: border-color var(--transition-base);

  &::placeholder {
    color: var(--ink-disabled);
    font-family: var(--font-ui);
  }

  &:focus {
    border-color: var(--accent-sand);
    background: var(--bg-surface);
  }
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
`

const SubmitButton = styled.button`
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-surface);
  background: var(--ink-primary);

  &:disabled {
    opacity: 0.4;
  }
`

const SentenceCount = styled.p`
  font-size: 13px;
  color: var(--ink-tertiary);
  font-weight: 500;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
`

const EmptyText = styled.p`
  font-size: 13px;
  color: var(--ink-disabled);
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

const PracticeLink = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-sand);
  cursor: pointer;
`
