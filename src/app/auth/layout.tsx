// src/app/auth/layout.tsx
// Layout for login and signup pages — centered, branded

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Top bar */}
      <div className="bg-green-dark py-3 px-6 text-center">
        <span className="font-arabic text-gold-light text-sm">
          خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
        </span>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-10 pb-2">
        <a href="https://quranmentorglobal.com" className="text-center">
          <div className="font-display text-2xl font-bold text-green-dark">
            Quran <span className="text-gold">Mentor</span> Global
          </div>
          <div className="text-xs text-ink-light tracking-widest uppercase mt-1">
            Learn · Connect · Grow
          </div>
        </a>
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-ink-light">
        © 2025 Quran Mentor Global · All rights reserved
      </div>

    </div>
  )
}
