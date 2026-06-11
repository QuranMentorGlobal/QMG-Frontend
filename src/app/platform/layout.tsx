// src/app/platform/layout.tsx
// Main platform layout — sidebar + content area
// Reads the user's role and shows correct nav

import { requireAuth } from '@/lib/auth'
import Link from 'next/link'

const studentNav = [
  { href: '/platform/student/dashboard', label: 'Dashboard',   icon: '🏠' },
  { href: '/platform/student/bookings',  label: 'My Bookings', icon: '📅' },
  { href: '/platform/student/lessons',   label: 'My Lessons',  icon: '📖' },
  { href: '/platform/student/profile',   label: 'Profile',     icon: '👤' },
]

const teacherNav = [
  { href: '/platform/teacher/dashboard', label: 'Dashboard',  icon: '🏠' },
  { href: '/platform/teacher/bookings',  label: 'Bookings',   icon: '📅' },
  { href: '/platform/teacher/courses',   label: 'My Courses', icon: '📚' },
  { href: '/platform/teacher/profile',   label: 'Profile',    icon: '👤' },
]

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAuth()
  const nav = profile.role === 'teacher' ? teacherNav : studentNav

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-green-dark flex flex-col fixed h-full z-50 hidden md:flex">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="font-display text-lg font-bold text-white">
            Quran <span className="text-gold">Mentor</span> Global
          </div>
          <div className="text-[10px] text-white/40 tracking-widest uppercase mt-0.5">
            {profile.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70
                         hover:bg-white/10 hover:text-white transition-all duration-200
                         text-sm font-medium"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </div>
            <div>
              <div className="text-white text-sm font-medium leading-none">
                {profile.first_name} {profile.last_name}
              </div>
              <div className="text-white/40 text-xs mt-0.5 capitalize">{profile.role}</div>
            </div>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 rounded-xl text-white/50
                         hover:bg-white/10 hover:text-white transition-all duration-200
                         text-sm"
            >
              🚪 Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 md:ml-64 min-h-screen">

        {/* Top bar (mobile) */}
        <div className="md:hidden bg-green-dark px-4 py-3 flex items-center justify-between">
          <div className="font-display text-base font-bold text-white">
            QMG <span className="text-gold">Platform</span>
          </div>
          <div className="text-white/60 text-sm">{profile.first_name}</div>
        </div>

        {/* Page content */}
        <div className="p-6 md:p-8 max-w-6xl">
          {children}
        </div>
      </main>

    </div>
  )
}
