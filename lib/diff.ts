// ─── 텍스트 정규화 ────────────────────────────────

export function normalize(s: string): string {
  return s
    .replace(/[""''""]/g, '') // 따옴표 제거
    .replace(/[.,!?;:…]/g, '') // 문장부호 제거
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function isCorrect(original: string, input: string): boolean {
  return normalize(original) === normalize(input)
}

// ─── 단어 단위 Diff ────────────────────────────────
// 원문을 기준으로 각 단어가 맞는지 표시

export interface DiffWord {
  word: string // 원문 단어
  status: 'correct' | 'wrong' | 'missing'
}

export function diffWords(original: string, input: string): DiffWord[] {
  const origWords = normalize(original).split(' ')
  const inputWords = normalize(input).split(' ')

  return origWords.map((word, i) => {
    const inputWord = inputWords[i]
    if (inputWord === undefined) return { word, status: 'missing' }
    if (word === inputWord) return { word, status: 'correct' }
    return { word, status: 'wrong' }
  })
}

// ─── 정확도 계산 ───────────────────────────────────

export function calcAccuracy(original: string, input: string): number {
  const diffs = diffWords(original, input)
  const correct = diffs.filter((d) => d.status === 'correct').length
  return Math.round((correct / diffs.length) * 100)
}
