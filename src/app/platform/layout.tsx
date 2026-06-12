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

type ProfileRow = {
  role: string
  first_name: string | null
  last_name: string | null
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

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-6 py-5">
      <img src="/logo.png" alt="QMG" className="h-9 w-auto object-contain" />
      <div className="hidden lg:block">
        <p className="text-sm font-bold text-[#0D3D20] leading-tight">Quran Mentor</p>
        <p className="text-xs text-[#B8952A] font-semibold leading-tight">Global</p>
      </div>
    </Link>
  )
}

function Sidebar({
  nav, role, userName, onSignOut,
}: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const pathname = usePathname()

  const roleLabel: Record<UserRole, string> = {
    student: 'Student',
    teacher: 'Teacher',
    parent:  'Parent',
    admin:   'Admin',
  }

  const roleColor: Record<UserRole, string> = {
    student: 'bg-blue-100 text-blue-700',
    teacher: 'bg-green-100 text-green-700',
    parent:  'bg-yellow-100 text-yellow-700',
    admin:   'bg-red-100 text-red-700',
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#EDE6D6] min-h-screen fixed top-0 left-0 z-40">
      <Logo />

      <div className="px-5 py-4 border-b border-[#F5F0E8]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0D3D20] truncate">{userName}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleColor[role]}`}>
              {roleLabel[role]}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1B5E37] text-white shadow-sm'
                  : 'text-[#555] hover:bg-[#F5F0E8] hover:text-[#0D3D20]'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-6 pt-2 border-t border-[#F5F0E8]">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#888] hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="text-base">🚪</span>
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-[#bbb] mt-3 px-3">QuranMentorGlobal.com</p>
      </div>
    </aside>
  )
}

function BottomTabs({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname()
  const visibleTabs = nav.slice(0, 5)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EDE6D6] flex">
      {visibleTabs.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[9px] font-semibold transition-colors ${
              active ? 'text-[#1B5E37]' : 'text-[#aaa]'
            }`}
          >
            <span className={`text-xl mb-0.5 leading-none ${active ? '' : 'grayscale opacity-70'}`}>{item.icon}</span>
            <span className="leading-tight">{item.label.split(' ')[0]}</span>
          </Link>
        )
      })}
    </nav>
  )
}

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .returns<ProfileRow>()
        .single()

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
  const nav = navMap[role] ?? studentNav

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1B5E37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#888]">Loading platform…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />
      <BottomTabs nav={nav} />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
