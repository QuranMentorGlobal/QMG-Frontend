'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, BookOpen, Calendar, User,
  ShieldCheck, LogOut, Menu, X, ChevronRight, Users, GraduationCap
} from 'lucide-react'

const STUDENT_NAV = [
  { href: '/platform/student/dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/platform/teachers',          label: 'Browse Teachers',  icon: GraduationCap   },
  { href: '/platform/student/bookings',  label: 'My Bookings',      icon: Calendar        },
  { href: '/platform/student/profile',   label: 'My Profile',       icon: User            },
]

const TEACHER_NAV = [
  { href: '/platform/teacher/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/platform/teacher/verification',  label: 'Verification',  icon: ShieldCheck     },
  { href: '/platform/teacher/courses',       label: 'My Courses',    icon: BookOpen        },
  { href: '/platform/teacher/bookings',      label: 'Bookings',      icon: Calendar        },
  { href: '/platform/teacher/profile',       label: 'My Profile',    icon: User            },
]

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (!prof) { router.replace('/auth/login'); return }

      setProfile(prof as any)
      setRole((prof as any).role)

      if ((prof as any).role === 'teacher') {
        const { data: tp } = await supabase
          .from('teacher_profiles').select('status').eq('user_id', user.id).single()
        setVerificationStatus((tp as any)?.status || 'not_submitted')
      }
    }
    load()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = role === 'teacher' ? TEACHER_NAV : STUDENT_NAV

  const statusBadge: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
    pending:      { label: 'Under Review',   color: '#D97706', bg: '#FEF3C7', emoji: '🟡' },
    approved:     { label: 'Verified',       color: '#1B5E37', bg: '#E8F5EE', emoji: '✅' },
    rejected:     { label: 'Action Needed',  color: '#DC2626', bg: '#FEE2E2', emoji: '❌' },
    not_submitted:{ label: 'Not Submitted',  color: '#6B7280', bg: '#F3F4F6', emoji: '⬜' },
  }

  const badge = verificationStatus ? statusBadge[verificationStatus] : null

  function isActive(href: string) {
    return pathname === href
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0D3D20 0%, #1B5E37 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <a href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(184,149,42,0.2)', border: '1px solid rgba(184,149,42,0.4)' }}>
            🕌
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
            </p>
          </div>
        </a>
      </div>

      {/* Verification badge for teachers */}
      {role === 'teacher' && badge && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm">{badge.emoji}</span>
          <div>
            <p className="text-xs font-bold text-white leading-tight">Verification</p>
            <p className="text-xs" style={{ color: badge.color === '#1B5E37' ? '#86EFAC' : '#FCA5A5' }}>
              {badge.label}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          const isVerification = href.includes('verification')
          const isCourses = href.includes('courses')
          const locked = isCourses && role === 'teacher' &&
            verificationStatus !== 'approved'

          return (
            <button
              key={href}
              onClick={() => {
                if (!locked) { router.push(href); setSidebarOpen(false) }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                color: locked
                  ? 'rgba(255,255,255,0.25)'
                  : active
                    ? '#fff'
                    : isVerification && verificationStatus !== 'approved'
                      ? '#FCD34D'
                      : 'rgba(255,255,255,0.6)',
                cursor: locked ? 'not-allowed' : 'pointer',
              }}>
              <Icon size={17} className="flex-shrink-0" />
              <span className="flex-1 text-left leading-tight">{label}</span>
              {locked && <span className="text-xs">🔒</span>}
              {active && !locked && <ChevronRight size={14} style={{ color: '#D4AF50' }} />}
              {isVerification && verificationStatus === 'pending' && (
                <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              )}
              {isVerification && verificationStatus === 'rejected' && (
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
        {profile && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" />
                : `${(profile.first_name || '?')[0]}${(profile.last_name || '')[0]}`.toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-xs truncate capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {role}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.5)' }}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F0E8' }}>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 flex-shrink-0 h-full">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          {profile && (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs capitalize" style={{ color: '#6B6B6B' }}>{role}</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" />
                  : `${(profile.first_name || '?')[0]}${(profile.last_name || '')[0]}`.toUpperCase()
                }
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
