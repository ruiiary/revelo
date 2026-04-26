import AppLayout from '@/components/layout/AppLayout'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div style={{ padding: '24px 20px' }}>
        <h1 style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink-primary)' }}>설정</h1>
        <p style={{ color: 'var(--ink-tertiary)', marginTop: 8 }}>Phase 1에서 기본 구성 예정</p>
      </div>
    </AppLayout>
  )
}
