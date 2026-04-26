import AppLayout from '@/components/layout/AppLayout'

export default function FeedPage() {
  return (
    <AppLayout>
      <div style={{ padding: '24px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink-primary)' }}>추천 문장</h1>
        <p style={{ color: 'var(--ink-tertiary)', marginTop: 8 }}>Phase 2에서 구현 예정</p>
      </div>
    </AppLayout>
  )
}
