const CACHE_NAME = 'revelo-v2'

const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/practice',
  '/library',
  '/notebook',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// 설치: 핵심 페이지 선캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

// 활성화: 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

// fetch: Network-first (실패 시 캐시 fallback)
self.addEventListener('fetch', (event) => {
  // Supabase API 요청은 캐시하지 않음
  if (event.request.url.includes('supabase.co')) return

  // navigation 요청 (페이지 이동)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/dashboard').then((r) => r ?? Response.error())
      )
    )
    return
  }

  // 정적 자원(이미지·폰트만): Cache-first. JS/CSS는 Next.js가 관리하므로 제외
  if (event.request.destination === 'image' || event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((res) => {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            return res
          })
      )
    )
  }
})
