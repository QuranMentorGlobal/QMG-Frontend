// src/app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Quran Mentor Global — Learn Quran Online',
    template: '%s | Quran Mentor Global',
  },
  description: 'Connect with certified Qaris and Quran teachers worldwide. Personalized one-to-one online Quran classes for all ages.',
  keywords: ['Quran', 'online Quran classes', 'Tajweed', 'Hifz', 'learn Quran', 'Quran teacher'],
  authors: [{ name: 'Quran Mentor Global' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.quranmentorglobal.com',
    siteName: 'Quran Mentor Global',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
