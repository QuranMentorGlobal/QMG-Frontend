'use client'

// ─────────────────────────────────────────────────────────────────────────────
// DashboardBanner — auto-sliding image banner for platform dashboards
//
// IMAGE SETUP — create folder public/banners/ in GitHub and add these files:
//
// Size: 1300 × 360 px, saved as .jpg (compress to under 300KB via tinyjpg.com)
//
// STUDENT:
//   public/banners/student-1.jpg
//   public/banners/student-2.jpg
//   public/banners/student-3.jpg
//
// TEACHER:
//   public/banners/teacher-1.jpg
//   public/banners/teacher-2.jpg
//   public/banners/teacher-3.jpg
//
// PARENT:
//   public/banners/parent-1.jpg
//   public/banners/parent-2.jpg
//   public/banners/parent-3.jpg
//
// ChatGPT prompt template:
// "Professional wide banner image for an online Quran learning platform.
//  [DESCRIPTION]. Warm green (#1B5E37) and gold (#B8952A) color palette,
//  soft lighting. No text, no watermarks. 1300x360px landscape, photorealistic."
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'

type Role = 'student' | 'teacher' | 'parent'

interface BannerSlide {
  src: string
  alt: string
  headline: string
  sub: string
}

const slides: Record<Role, BannerSlide[]> = {
  student: [
    { src: '/banners/student-1.jpg', alt: 'Student learning Quran', headline: 'Continue Your Journey', sub: 'Every lesson brings you closer to Allah.' },
    { src: '/banners/student-2.jpg', alt: 'Quran study environment', headline: 'Deepen Your Understanding', sub: 'Tajweed, Hifz, Tafseer — learn at your pace.' },
    { src: '/banners/student-3.jpg', alt: 'Live Quran lesson',       headline: 'Your Teacher is Ready',  sub: 'Book your next lesson in seconds.' },
  ],
  teacher: [
    { src: '/banners/teacher-1.jpg', alt: 'Quran teacher at desk',      headline: 'Welcome Back, Teacher', sub: 'Your students are waiting for your guidance.' },
    { src: '/banners/teacher-2.jpg', alt: 'Arabic calligraphy teacher', headline: 'Share Your Knowledge',  sub: 'Earn while teaching the words of Allah.' },
    { src: '/banners/teacher-3.jpg', alt: 'Teacher recording lesson',   headline: 'Grow Your Students',   sub: 'Complete verification to go live on the platform.' },
  ],
  parent: [
    { src: '/banners/parent-1.jpg', alt: 'Parent and child with Quran',        headline: 'Nurture Their Journey', sub: "Track your child's progress every step of the way." },
    { src: '/banners/parent-2.jpg', alt: 'Mother watching online lesson',      headline: 'Learning, Supervised',  sub: 'Safe, certified teachers for your children.' },
    { src: '/banners/parent-3.jpg', alt: 'Family with Quran',                  headline: 'A Gift for Life',       sub: 'Give your child the Quran — the greatest inheritance.' },
  ],
}

const fallbackGradient: Record<Role, string> = {
  student: 'linear-gradient(120deg, #0D3D20 0%, #1B5E37 55%, #2A5A1A 100%)',
  teacher: 'linear-gradient(120deg, #0D3D20 0%, #1B5E37 40%, #B8952A 100%)',
  parent:  'linear-gradient(120deg, #0D3D20 0%, #1B5E37 45%, #8B6914 100%)',
}

export default function DashboardBanner({ role }: { role: Role }) {
  const [current, setCurrent]   = useState(0)
  const [imgError, setImgError] = useState<Record<number, boolean>>({})
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const list = slides[role] ?? slides.student

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % list.length), 4500)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [list.length])

  function goTo(i: number) {
    setCurrent(i)
    startTimer() // reset timer on manual click
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden mb-8"
      style={{
        // 1300×360 = ~27.7% aspect ratio
        // paddingTop keeps ratio on all screen sizes; height is driven by aspect ratio
        aspectRatio: '1300 / 360',
        maxHeight: 360,
        minHeight: 160,
        background: fallbackGradient[role],
      }}
    >
      {/* Slides */}
      {list.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {/* Only render img if no error */}
          {!imgError[i] && (
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
              onError={() => setImgError(prev => ({ ...prev, [i]: true }))}
            />
          )}
          {/* Gradient overlay — always shown for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(13,61,32,0.82) 0%, rgba(13,61,32,0.5) 50%, rgba(13,61,32,0.15) 100%)',
            }}
          />
        </div>
      ))}

      {/* Text — always on top */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10"
        style={{ zIndex: 10 }}
      >
        <p
          className="font-semibold tracking-widest uppercase mb-1"
          style={{ color: '#D4AF50', fontSize: 'clamp(9px, 1vw, 11px)' }}
        >
          QuranMentorGlobal
        </p>
        <h2
          className="font-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(16px, 2.8vw, 28px)',
            color: '#fff',
            lineHeight: 1.2,
          }}
        >
          {list[current].headline}
        </h2>
        <p style={{ fontSize: 'clamp(11px, 1.4vw, 15px)', color: 'rgba(255,255,255,0.82)' }}>
          {list[current].sub}
        </p>
      </div>

      {/* Dot indicators */}
      <div
        className="absolute flex gap-1.5"
        style={{ bottom: 14, right: 18, zIndex: 10 }}
      >
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current ? '#D4AF50' : 'rgba(255,255,255,0.35)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
