'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styled, { keyframes, css } from 'styled-components'
import AppLayout from '@/components/layout/AppLayout'
import Icon from '@/components/ui/Icon'
import { fetchCuratedSentences, fetchSentenceById, type CuratedSentence } from '@/lib/supabase'
import {
  getSentenceById,
  addSentence,
  addPracticeLog,
  setLanguage,
  type Language,
} from '@/lib/storage'
import { isCorrect, diffWords, calcAccuracy } from '@/lib/diff'

// ─── Types ────────────────────────────────────────

type Step =
  | 'language-select'
  | 'sentence-select'
  | 'read'
  | 'cover'
  | 'write'
  | 'compare'
  | 'complete'

interface PracticeSentence {
  id: string
  content: string
  sourceTitle: string
  sourceAuthor: string
  translation: string | null
  isLocal: boolean
}

const STEP_ORDER: Step[] = ['read', 'cover', 'write', 'compare', 'complete']
const STEP_LABEL = ['읽기', '덮기', '쓰기', '비교', '완료']

// ─── Main Component ───────────────────────────────

function PracticeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const sentenceId = searchParams.get('sentenceId')
  const isLocal = searchParams.get('local') === 'true'

  const [step, setStep] = useState<Step>(sentenceId ? 'read' : 'language-select')
  const [language, setLang] = useState<Language>('en')
  const [sentenceList, setSentenceList] = useState<CuratedSentence[]>([])
  const [sentence, setSentence] = useState<PracticeSentence | null>(null)
  const [userInput, setUserInput] = useState('')
  const [correct, setCorrect] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [covering, setCovering] = useState(false)
  const [loading, setLoading] = useState(!!sentenceId)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customContent, setCustomContent] = useState('')
  const [customSourceTitle, setCustomSourceTitle] = useState('')
  const [customSourceAuthor, setCustomSourceAuthor] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // URL로 진입 시 문장 로드
  useEffect(() => {
    if (!sentenceId) return

    if (isLocal) {
      const s = getSentenceById(sentenceId)
      if (s) {
        setSentence({
          id: s.id,
          content: s.content,
          sourceTitle: '',
          sourceAuthor: '',
          translation: null,
          isLocal: true,
        })
      }
      setLoading(false)
    } else {
      fetchSentenceById(sentenceId).then((s) => {
        if (s) {
          setSentence({
            id: s.id,
            content: s.content,
            sourceTitle: s.source_title,
            sourceAuthor: s.source_author,
            translation: s.translation ?? null,
            isLocal: false,
          })
        }
        setLoading(false)
      })
    }
  }, [sentenceId, isLocal])

  // Write 단계 자동 포커스
  useEffect(() => {
    if (step === 'write') {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [step])

  function handleLangSelect(lang: Language) {
    setLang(lang)
    setLanguage(lang)
    setLoading(true)
    fetchCuratedSentences(lang)
      .then(setSentenceList)
      .finally(() => setLoading(false))
    setStep('sentence-select')
  }

  function handleCustomStart() {
    if (!customContent.trim()) return
    const saved = addSentence({
      book_id: null,
      content: customContent.trim(),
      page: null,
      language,
      is_curated: false,
    })
    setSentence({
      id: saved.id,
      content: saved.content,
      sourceTitle: customSourceTitle.trim(),
      sourceAuthor: customSourceAuthor.trim(),
      translation: null,
      isLocal: true,
    })
    setCustomContent('')
    setCustomSourceTitle('')
    setCustomSourceAuthor('')
    setShowCustomInput(false)
    setStep('read')
  }

  function handleSentenceSelect(s: CuratedSentence) {
    setSentence({
      id: s.id,
      content: s.content,
      sourceTitle: s.source_title,
      sourceAuthor: s.source_author,
      translation: s.translation ?? null,
      isLocal: false,
    })
    setStep('read')
  }

  function handleCover() {
    setCovering(true)
    setTimeout(() => {
      setCovering(false)
      setStep('cover')
    }, 600)
  }

  function handleSubmit() {
    if (!sentence || !userInput.trim()) return
    const result = isCorrect(sentence.content, userInput)
    const acc = calcAccuracy(sentence.content, userInput)
    setCorrect(result)
    setAccuracy(acc)
    addPracticeLog({ sentence_id: sentence.id, user_input: userInput, is_correct: result })
    setStep('compare')
  }

  function handleRetry() {
    setUserInput('')
    setStep('write')
  }

  function handleComplete() {
    setStep('complete')
  }

  function handleNext() {
    setSentence(null)
    setUserInput('')
    setCorrect(false)
    if (sentenceId) {
      router.push('/dashboard')
    } else {
      setStep('sentence-select')
    }
  }

  const stepIndex = STEP_ORDER.indexOf(step)

  // ── 로딩 ──
  if (loading) {
    return (
      <AppLayout hideNav>
        <CenteredScreen>
          <LoadingText>불러오는 중...</LoadingText>
        </CenteredScreen>
      </AppLayout>
    )
  }

  // ── 언어 선택 ──
  if (step === 'language-select') {
    return (
      <AppLayout>
        <Screen>
          <ScreenHeader>
            <ScreenTitle>어떤 필사를 할까요?</ScreenTitle>
            <ScreenSub>오늘 필사할 언어를 선택해요</ScreenSub>
          </ScreenHeader>
          <ChoiceList>
            <ChoiceCard onClick={() => handleLangSelect('en')}>
              <ChoiceInfo>
                <ChoiceTitle>영어 필사</ChoiceTitle>
                <ChoiceDesc>소설·에세이·명언 속 영어 문장</ChoiceDesc>
              </ChoiceInfo>
              <Icon name="chevron-right" size={18} />
            </ChoiceCard>
            <ChoiceCard onClick={() => handleLangSelect('ko')}>
              <ChoiceInfo>
                <ChoiceTitle>한국어 독서 필사</ChoiceTitle>
                <ChoiceDesc>읽은 책에서 직접 고른 한국어 문장</ChoiceDesc>
              </ChoiceInfo>
              <Icon name="chevron-right" size={18} />
            </ChoiceCard>
          </ChoiceList>
        </Screen>
      </AppLayout>
    )
  }

  // ── 문장 선택 ──
  if (step === 'sentence-select') {
    return (
      <AppLayout>
        <Screen>
          <ScreenHeader>
            <ScreenTitle>문장을 골라요</ScreenTitle>
            <ScreenSub>{language === 'en' ? '영어 필사' : '한국어 독서 필사'}</ScreenSub>
          </ScreenHeader>

          {/* 직접 입력 */}
          {showCustomInput ? (
            <CustomInputCard>
              <CustomInputTitle>문장 직접 입력</CustomInputTitle>
              <CustomTextarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="필사할 문장을 입력하세요"
                rows={4}
                autoFocus
              />
              <CustomFieldRow>
                <CustomInput
                  value={customSourceTitle}
                  onChange={(e) => setCustomSourceTitle(e.target.value)}
                  placeholder="책 제목 (선택)"
                />
                <CustomInput
                  value={customSourceAuthor}
                  onChange={(e) => setCustomSourceAuthor(e.target.value)}
                  placeholder="저자 (선택)"
                />
              </CustomFieldRow>
              <CustomActions>
                <CancelCustomBtn onClick={() => setShowCustomInput(false)}>취소</CancelCustomBtn>
                <StartCustomBtn onClick={handleCustomStart} disabled={!customContent.trim()}>
                  이 문장으로 필사
                </StartCustomBtn>
              </CustomActions>
            </CustomInputCard>
          ) : (
            <DirectInputBtn onClick={() => setShowCustomInput(true)}>
              <Icon name="pen" size={16} />
              문장 직접 입력하기
            </DirectInputBtn>
          )}

          <SectionDivider>추천 문장</SectionDivider>

          {sentenceList.length === 0 && <EmptyMsg>불러올 문장이 없어요</EmptyMsg>}
          <SelectList>
            {sentenceList.map((s) => (
              <SelectItem key={s.id} onClick={() => handleSentenceSelect(s)}>
                <SelectQuote>&ldquo;{s.content}&rdquo;</SelectQuote>
                <SelectMeta>
                  {s.source_author} · {s.source_title}
                </SelectMeta>
              </SelectItem>
            ))}
          </SelectList>
        </Screen>
      </AppLayout>
    )
  }

  if (!sentence) return null

  const diffs = step === 'compare' ? diffWords(sentence.content, userInput) : []

  return (
    <AppLayout hideNav>
      <PracticeScreen>
        {/* 상단 바 */}
        <TopBar>
          <BackBtn onClick={() => (step === 'read' ? router.back() : handleNext())}>
            <Icon name="close" size={20} />
          </BackBtn>
          <StepIndicator>
            {STEP_ORDER.map((s, i) => (
              <StepDot key={s} $active={i === stepIndex} $done={i < stepIndex} />
            ))}
          </StepIndicator>
          <StepLabel>{stepIndex >= 0 ? STEP_LABEL[stepIndex] : ''}</StepLabel>
        </TopBar>

        {/* 출처 */}
        {sentence.sourceTitle && (
          <SourceBar>
            <SourceText>
              {sentence.sourceTitle} — {sentence.sourceAuthor}
            </SourceText>
          </SourceBar>
        )}

        {/* ── Read ── */}
        {(step === 'read' || covering) && (
          <StepArea>
            <SentenceBlock $fading={covering}>&ldquo;{sentence.content}&rdquo;</SentenceBlock>
            {sentence.translation && (
              <TranslationBlock $fading={covering}>{sentence.translation}</TranslationBlock>
            )}
            <Hint>문장을 충분히 읽어보세요</Hint>
          </StepArea>
        )}

        {/* ── Cover + Write ── */}
        {(step === 'cover' || step === 'write') && !covering && (
          <StepArea>
            <CoveredBlock>
              {Array.from({ length: Math.ceil(sentence.content.length / 8) }).map((_, i) => (
                <CoverBar key={i} />
              ))}
            </CoveredBlock>
            {sentence.translation && <TranslationHint>{sentence.translation}</TranslationHint>}
            <WriteTextarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value)
                if (step === 'cover') setStep('write')
              }}
              onFocus={() => {
                if (step === 'cover') setStep('write')
              }}
              placeholder="이제 기억나는 대로 써보세요"
              rows={5}
            />
          </StepArea>
        )}

        {/* ── Compare ── */}
        {step === 'compare' && (
          <StepArea>
            <CompareBlock>
              <CompareLabel>원문</CompareLabel>
              <DiffLine>
                {diffs.map((d, i) => (
                  <DiffWord key={i} $status={d.status}>
                    {d.word}{' '}
                  </DiffWord>
                ))}
              </DiffLine>
            </CompareBlock>

            <CompareBlock>
              <CompareLabel>내가 쓴 문장</CompareLabel>
              <UserText>{userInput}</UserText>
            </CompareBlock>

            <ResultBadge $correct={correct}>
              {correct ? '그대로 써냈어요' : `${accuracy}% 일치 — 다시 한번 써볼까요?`}
            </ResultBadge>
          </StepArea>
        )}

        {/* ── Complete ── */}
        {step === 'complete' && (
          <StepArea>
            <CompleteIcon>
              <Icon name="check" size={28} style={{ color: 'var(--bg-surface)' }} />
            </CompleteIcon>
            <CompleteTitle>{correct ? '문장을 쌓았어요' : '필사를 마쳤어요'}</CompleteTitle>
            <CompleteSentence>&ldquo;{sentence.content}&rdquo;</CompleteSentence>
          </StepArea>
        )}

        {/* ── 하단 고정 버튼 ── */}
        <BottomBar>
          {(step === 'read' || covering) && (
            <PrimaryBtn onClick={handleCover} disabled={covering}>
              덮기
            </PrimaryBtn>
          )}
          {step === 'write' && (
            <PrimaryBtn onClick={handleSubmit} disabled={!userInput.trim()}>
              비교하기
            </PrimaryBtn>
          )}
          {step === 'compare' && (
            <BtnRow>
              {!correct && <SecondaryBtn onClick={handleRetry}>다시 쓰기</SecondaryBtn>}
              <PrimaryBtn onClick={handleComplete}>{correct ? '완료' : '그냥 넘어가기'}</PrimaryBtn>
            </BtnRow>
          )}
          {step === 'complete' && (
            <BtnRow>
              <SecondaryBtn onClick={() => router.push('/dashboard')}>홈으로</SecondaryBtn>
              <PrimaryBtn onClick={handleNext}>{sentenceId ? '홈으로' : '다음 문장'}</PrimaryBtn>
            </BtnRow>
          )}
        </BottomBar>
      </PracticeScreen>
    </AppLayout>
  )
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticeContent />
    </Suspense>
  )
}

// ─── Styles ───────────────────────────────────────

const fadeOut = keyframes`
  from { opacity: 1; filter: blur(0); }
  to   { opacity: 0; filter: blur(8px); }
`

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Screen = styled.div`
  padding: 28px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const PracticeScreen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 0 0 32px;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
`

const BackBtn = styled.button`
  color: var(--ink-tertiary);
  display: flex;
  align-items: center;
`

const StepIndicator = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`

const StepDot = styled.div<{ $active: boolean; $done: boolean }>`
  width: ${({ $active }) => ($active ? '20px' : '6px')};
  height: 6px;
  border-radius: var(--radius-full);
  background: ${({ $active, $done }) =>
    $active ? 'var(--ink-primary)' : $done ? 'var(--accent-sand)' : 'var(--bg-muted)'};
  transition: all var(--transition-base);
`

const StepLabel = styled.span`
  font-size: 12px;
  color: var(--ink-tertiary);
  font-weight: 500;
  min-width: 28px;
  text-align: right;
`

const SourceBar = styled.div`
  padding: 0 20px 12px;
`

const SourceText = styled.span`
  font-size: 11px;
  color: var(--ink-disabled);
`

const StepArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 20px 0;
  animation: ${fadeIn} 0.3s ease;
`

const BottomBar = styled.div`
  margin-top: auto;
  padding: 16px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SentenceBlock = styled.p<{ $fading: boolean }>`
  font-family: var(--font-sentence);
  font-size: 20px;
  line-height: 1.8;
  color: var(--ink-primary);
  word-break: keep-all;
  ${({ $fading }) =>
    $fading &&
    css`
      animation: ${fadeOut} 0.5s ease forwards;
    `}
`

const CoveredBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 0;
`

const CoverBar = styled.div`
  height: 18px;
  background: var(--bg-muted);
  border-radius: var(--radius-sm);
  width: ${() => 60 + Math.random() * 35}%;
`

const Hint = styled.p`
  font-size: 13px;
  color: var(--ink-tertiary);
`

const TranslationBlock = styled.p<{ $fading: boolean }>`
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-tertiary);
  padding: 12px 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  word-break: keep-all;
  ${({ $fading }) =>
    $fading &&
    css`
      animation: ${fadeOut} 0.5s ease forwards;
    `}
`

const TranslationHint = styled.p`
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink-tertiary);
  padding: 10px 14px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent-sand);
  word-break: keep-all;
`

const WriteTextarea = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1.5px solid var(--bg-muted);
  border-radius: var(--radius-md);
  font-family: var(--font-sentence);
  font-size: 17px;
  line-height: 1.8;
  color: var(--ink-primary);
  outline: none;
  resize: none;
  transition: border-color var(--transition-base);

  &::placeholder {
    color: var(--ink-disabled);
    font-family: var(--font-ui);
    font-size: 14px;
  }

  &:focus {
    border-color: var(--accent-sand);
  }
`

const CompareBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CompareLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-tertiary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const DiffLine = styled.p`
  font-family: var(--font-sentence);
  font-size: 16px;
  line-height: 1.8;
  word-break: keep-all;
`

const DiffWord = styled.span<{ $status: 'correct' | 'wrong' | 'missing' }>`
  color: ${({ $status }) =>
    $status === 'correct'
      ? 'var(--ink-primary)'
      : $status === 'wrong'
        ? 'var(--state-error)'
        : 'var(--ink-disabled)'};
  text-decoration: ${({ $status }) => ($status === 'missing' ? 'line-through' : 'none')};
`

const UserText = styled.p`
  font-family: var(--font-sentence);
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink-secondary);
  background: var(--bg-subtle);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  word-break: keep-all;
`

const ResultBadge = styled.div<{ $correct: boolean }>`
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  background: ${({ $correct }) =>
    $correct ? 'rgba(90, 143, 106, 0.12)' : 'rgba(192, 97, 74, 0.08)'};
  color: ${({ $correct }) => ($correct ? 'var(--state-success)' : 'var(--state-error)')};
`

const CompleteIcon = styled.div`
  width: 56px;
  height: 56px;
  background: var(--ink-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px auto 0;
`

const CompleteTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  text-align: center;
  letter-spacing: -0.02em;
`

const CompleteSentence = styled.p`
  font-family: var(--font-sentence);
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink-secondary);
  text-align: center;
  word-break: keep-all;
  padding: 0 8px;
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
`

const PrimaryBtn = styled.button`
  flex: 1;
  padding: 14px;
  background: var(--ink-primary);
  color: var(--bg-surface);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 700;
  transition: opacity var(--transition-base);

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:not(:disabled):hover {
    opacity: 0.85;
  }
`

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 14px;
  background: var(--bg-surface);
  color: var(--ink-primary);
  border: 1.5px solid var(--bg-muted);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--ink-disabled);
  }
`

const ScreenHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const ScreenTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
`

const ScreenSub = styled.p`
  font-size: 13px;
  color: var(--ink-tertiary);
`

const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ChoiceCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  background: var(--bg-surface);
  border: 1.5px solid var(--bg-muted);
  border-radius: var(--radius-md);
  width: 100%;
  text-align: left;
  color: var(--ink-tertiary);
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--accent-sand);
    color: var(--ink-secondary);
  }
`

const ChoiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ChoiceTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-primary);
`

const ChoiceDesc = styled.span`
  font-size: 12px;
  color: var(--ink-secondary);
`

const SelectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const SelectItem = styled.button`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--bg-muted);
  border-radius: var(--radius-md);
  text-align: left;
  width: 100%;
  transition: border-color var(--transition-base);

  &:hover {
    border-color: var(--accent-sand);
  }
`

const SelectQuote = styled.p`
  font-family: var(--font-sentence);
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-primary);
  word-break: keep-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const SelectMeta = styled.span`
  font-size: 11px;
  color: var(--ink-tertiary);
`

const EmptyMsg = styled.p`
  font-size: 14px;
  color: var(--ink-tertiary);
  padding: 32px 0;
  text-align: center;
`

const CenteredScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
`

const LoadingText = styled.p`
  font-size: 14px;
  color: var(--ink-tertiary);
`

// ─── 직접 입력 스타일 ──────────────────────────────

const DirectInputBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-surface);
  border: 1.5px dashed var(--bg-muted);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-secondary);
  transition:
    border-color var(--transition-base),
    color var(--transition-base);

  &:hover {
    border-color: var(--accent-sand);
    color: var(--ink-primary);
  }
`

const SectionDivider = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-disabled);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding-top: 4px;
`

const CustomInputCard = styled.div`
  background: var(--bg-surface);
  border: 1.5px solid var(--accent-sand);
  border-radius: var(--radius-md);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CustomInputTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-primary);
`

const CustomTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  font-family: var(--font-sentence);
  font-size: 15px;
  line-height: 1.75;
  color: var(--ink-primary);
  outline: none;
  resize: none;
  transition: border-color var(--transition-base);

  &::placeholder {
    color: var(--ink-disabled);
    font-family: var(--font-ui);
    font-size: 13px;
  }

  &:focus {
    border-color: var(--accent-sand);
    background: var(--bg-surface);
  }
`

const CustomFieldRow = styled.div`
  display: flex;
  gap: 8px;
`

const CustomInput = styled.input`
  flex: 1;
  padding: 9px 12px;
  background: var(--bg-subtle);
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 13px;
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

const CustomActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const CancelCustomBtn = styled.button`
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-tertiary);
  background: var(--bg-subtle);
`

const StartCustomBtn = styled.button`
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  color: var(--bg-surface);
  background: var(--ink-primary);
  transition: opacity var(--transition-base);

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &:not(:disabled):hover {
    opacity: 0.8;
  }
`
