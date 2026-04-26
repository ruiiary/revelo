import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from 'next/font/google'
import StyledComponentsRegistry from '@/lib/registry'
import PwaInit from '@/components/PwaInit'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const notoSerifKR = Noto_Serif_KR({
  variable: '--font-noto-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Revelo',
  description: '읽고, 덮고, 써보는 — 필사 기반 언어 학습 & 문장 아카이빙 서비스',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Revelo',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} ${notoSerifKR.variable} ${playfairDisplay.variable}`}
    >
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
        <PwaInit />
      </body>
    </html>
  )
}
