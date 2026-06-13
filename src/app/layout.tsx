import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'QuranMentorGlobal — Online Quran Academy',
  description: 'Learn Quran online with certified teachers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Amiri:wght@400&display=swap"
          rel="stylesheet"
        />
        {/* Preload hero slide 1 — highest priority, loads before anything else */}
        <link
          rel="preload"
          href="/images/hero/hero-1.png"
          as="image"
          fetchPriority="high"
        />
        {/* Favicon */}
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
