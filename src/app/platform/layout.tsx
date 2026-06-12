'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

interface NavItem {
  label: string
  href: string
  icon: string
}

const studentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/student/dashboard', icon: '🏠' },
  { label: 'Browse Teachers', href: '/platform/teachers',          icon: '🔍' },
  { label: 'My Bookings',     href: '/platform/student/bookings',  icon: '📅' },
  { label: 'My Lessons',      href: '/platform/student/lessons',   icon: '📚' },
  { label: 'Profile',         href: '/platform/student/profile',   icon: '👤' },
]

const teacherNav: NavItem[] = [
  { label: 'Dashboard',    href: '/platform/teacher/dashboard',    icon: '🏠' },
  { label: 'Verification', href: '/platform/teacher/verification', icon: '✅' },
  { label: 'My Courses',   href: '/platform/teacher/courses',      icon: '📖' },
  { label: 'Bookings',     href: '/platform/teacher/bookings',     icon: '📅' },
  { label: 'Profile',      href: '/platform/teacher/profile',      icon: '👤' },
]

const parentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/parent/dashboard', icon: '🏠' },
  { label: 'My Children',     href: '/platform/parent/children',  icon: '👨‍👩‍👧' },
  { label: 'Billing',         href: '/platform/parent/billing',   icon: '💳' },
  { label: 'Browse Teachers', href: '/platform/teachers',         icon: '🔍' },
]

const roleConfig: Record<UserRole, { label: string; subtag: string }> = {
  student: { label: 'Student',          subtag: 'STUDENT PORTAL'   },
  teacher: { label: 'Teacher',          subtag: 'TEACHER PORTAL'   },
  parent:  { label: 'Parent',           subtag: 'PARENT PORTAL'    },
  admin:   { label: 'Admin',            subtag: 'ADMIN PORTAL'     },
}

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('role, first_name, last_name')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as { role: string; first_name: string | null; last_name: string | null }
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({
  nav, role, userName, onSignOut,
}: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const cfg = roleConfig[role] ?? roleConfig.student

  return (
    <aside
      className="hidden md:flex flex-col w-44 min-h-screen fixed top-0 left-0 z-40"
      style={{ background: '#0D3D20', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Logo + platform name — single line */}
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.08)', textDecoration: 'none' }}
      >
        <img src="/logo.png" alt="QMG" className="h-7 w-auto object-contain flex-shrink-0" />
        <div style={{ lineHeight: 1 }}>
          {/* Single line: Quran + Mentor + Global */}
          <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#fff' }}>
            Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
          </p>
          <p className="text-[9px] font-semibold tracking-widest mt-0.5" style={{ color: 'rgba(212,175,80,0.7)' }}>
            {cfg.subtag}
          </p>
        </div>
      </Link>

      {/* User info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: '#B8952A', color: '#fff' }}
          >
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#fff' }}>{userName}</p>
            <p className="text-[10px]" style={{ color: '#D4AF50' }}>{cfg.label}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
              style={
                active
                  ? { background: '#1B5E37', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.65)' }
              }
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span className="text-sm w-4 text-center leading-none flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#FCA5A5'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <span className="text-sm w-4 text-center leading-none flex-shrink-0">🚪</span>
          <span>Sign Out</span>
        </button>
        <p className="text-[9px] px-3 mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          QuranMentorGlobal.com
        </p>
      </div>
    </aside>
  )
}

// ── Mobile bottom tabs ─────────────────────────────────────────────────────────

function BottomTabs({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: '#0D3D20', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {nav.slice(0, 5).map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            style={{ color: active ? '#D4AF50' : 'rgba(255,255,255,0.4)' }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold leading-tight">{item.label.split(' ')[0]}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Root layout ────────────────────────────────────────────────────────────────

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole]         = useState<UserRole>('student')
  const [userName, setUserName] = useState('')
  const [ready, setReady]       = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const profile = await fetchProfile(supabase, user.id)
      if (!profile) { router.push('/auth/login'); return }
      setRole((profile.role as UserRole) ?? 'student')
      setUserName(`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'User')
      setReady(true)
    }
    init()
  }, [])

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navMap: Record<UserRole, NavItem[]> = {
    student: studentNav,
    teacher: teacherNav,
    parent:  parentNav,
    admin:   studentNav,
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin mx-auto mb-3"
            style={{ borderColor: '#1B5E37', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#888' }}>Loading…</p>
        </div>
      </div>
    )
  }

  const nav = navMap[role] ?? studentNav

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <Sidebar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />
      <BottomTabs nav={nav} />
      {/* w-44 = 176px sidebar */}
      <main className="md:ml-44 pb-20 md:pb-0 p-6 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}
