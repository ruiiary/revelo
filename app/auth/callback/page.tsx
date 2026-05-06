'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getClient } from '@/lib/supabase'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
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

  return null
}

const pageStyle = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-base)',
  color: 'var(--ink-secondary)',
  fontSize: '15px',
} as const

export default function AuthCallbackPage() {
  return (
    <div style={pageStyle}>
      로그인 중...
      <Suspense>
        <AuthCallbackInner />
      </Suspense>
    </div>
  )
}
