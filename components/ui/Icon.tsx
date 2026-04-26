import React from 'react'

export type IconName =
  | 'home'
  | 'pen'
  | 'books'
  | 'note'
  | 'settings'
  | 'search'
  | 'plus'
  | 'bookmark'
  | 'book-open'
  | 'close'
  | 'star'
  | 'heart'
  | 'chevron-right'
  | 'chevron-left'
  | 'check'

interface IconProps {
  name: IconName
  size?: number
  className?: string
  style?: React.CSSProperties
}

const paths: Record<IconName, React.ReactNode> = {
  home: <path d="M3 9.5L10 3.5L17 9.5V17H13V13H7V17H3V9.5Z" />,
  pen: (
    <>
      <path d="M13.5 3.5L16.5 6.5L7.5 15.5H4.5V12.5L13.5 3.5Z" />
      <path d="M11.5 5.5L14.5 8.5" />
    </>
  ),
  books: (
    <>
      <rect x="3" y="4" width="4" height="12" rx="1" />
      <rect x="8" y="6" width="4" height="10" rx="1" />
      <rect x="13" y="3" width="4" height="13" rx="1" />
    </>
  ),
  note: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="1.5" />
      <line x1="7" y1="8" x2="13" y2="8" />
      <line x1="7" y1="11" x2="13" y2="11" />
      <line x1="7" y1="14" x2="10" y2="14" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.05 5.05l1.06 1.06M13.89 13.89l1.06 1.06M5.05 14.95l1.06-1.06M13.89 6.11l1.06-1.06" />
    </>
  ),
  search: (
    <>
      <circle cx="8.5" cy="8.5" r="5" />
      <line x1="12.5" y1="12.5" x2="17" y2="17" />
    </>
  ),
  plus: (
    <>
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="4" y1="10" x2="16" y2="10" />
    </>
  ),
  bookmark: <path d="M5 3h10v15l-5-3.5L5 18V3Z" />,
  'book-open': (
    <>
      <path d="M2 4.5C2 4.5 5 3 10 3s8 1.5 8 1.5V17S17 15.5 10 15.5 2 17 2 17V4.5Z" />
      <line x1="10" y1="3" x2="10" y2="15.5" />
    </>
  ),
  close: (
    <>
      <line x1="4" y1="4" x2="16" y2="16" />
      <line x1="16" y1="4" x2="4" y2="16" />
    </>
  ),
  star: (
    <path d="M10 2l2.39 4.84L17.61 8l-3.8 3.71.9 5.23L10 14.27l-4.71 2.47.9-5.23L2.39 8l5.22-.76L10 2Z" />
  ),
  heart: <path d="M10 16.5S3 12 3 7a4 4 0 0 1 7-2.65A4 4 0 0 1 17 7c0 5-7 9.5-7 9.5Z" />,
  'chevron-right': <polyline points="7 4 13 10 7 16" />,
  'chevron-left': <polyline points="13 4 7 10 13 16" />,
  check: <polyline points="4 10 8 14 16 6" />,
}

export default function Icon({ name, size = 20, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
