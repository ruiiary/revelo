'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Supabase가 OAuth 실패 시 error 파라미터와 함께 리다이렉트
    if (searchParams.get('error')) {
      router.replace('/')
      return
    }

    const { data } = getClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace('/dashboard')
      }
    })

    const fallback = setTimeout(() => router.replace('/'), 3000)

    return () => {
      data.subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [router, searchParams])

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
