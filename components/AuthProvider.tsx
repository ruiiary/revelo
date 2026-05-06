'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@/lib/supabase'
import {
  getSession,
  onAuthStateChange,
  signInWithKakao,
  signOut as supabaseSignOut,
} from '@/lib/supabase'
import { migrateToSupabase, hydrateFromSupabase } from '@/lib/migration'

interface AuthContextValue {
  user: User | null
  loading: boolean
  hydrated: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  hydrated: false,
  signIn: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // 초기 세션 복구
    getSession()
      .then((session) => setUser(session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    // 세션 변경 구독
    const unsubscribe = onAuthStateChange((nextUser) => {
      setUser(nextUser)
      // 첫 로그인 시 마이그레이션 실행
      if (nextUser) {
        migrateToSupabase(nextUser.id)
          .then(() => hydrateFromSupabase(nextUser.id))
          .then(() => setHydrated(true))
          .catch(console.error)
      } else {
        setHydrated(true)
      }
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async () => {
    await signInWithKakao()
  }, [])

  const signOut = useCallback(async () => {
    await supabaseSignOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, hydrated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
