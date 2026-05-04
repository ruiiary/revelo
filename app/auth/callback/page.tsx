'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getClient } from '@/lib/supabase'

// Supabase가 OAuth 완료 후 이 페이지로 리다이렉트한다.
// SDK가 URL fragment/query에서 세션을 자동으로 파싱하므로
// onAuthStateChange 이벤트를 기다렸다가 대시보드로 이동한다.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const { data } = getClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace('/dashboard')
      }
    })

    // 3초 안에 SIGNED_IN 이벤트가 없으면 랜딩으로 (로그인 실패 처리)
    const fallback = setTimeout(() => router.replace('/'), 3000)

    return () => {
      data.subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [router])

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--ink-secondary)',
        fontSize: '15px',
      }}
    >
      로그인 중...
    </div>
  )
}
