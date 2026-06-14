'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const Icons = {
  Dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Bookings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
  Lessons: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Verification: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  Courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  Children: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Billing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  ),
  SignOut: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Message: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  ChevronRight: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
}

// ── Nav Config ─────────────────────────────────────────────────────────────────

const studentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/student/dashboard', icon: Icons.Dashboard },
  { label: 'Browse Teachers', href: '/platform/teachers',          icon: Icons.Search },
  { label: 'My Bookings',     href: '/platform/student/bookings',  icon: Icons.Bookings },
  { label: 'My Lessons',      href: '/platform/student/lessons',   icon: Icons.Lessons },
  { label: 'Billing',         href: '/platform/student/billing',   icon: Icons.Billing },
  { label: 'Messages',        href: '/platform/messages',          icon: Icons.Message },
  { label: 'Profile',         href: '/platform/student/profile',   icon: Icons.Profile },
]

const teacherNav: NavItem[] = [
  { label: 'Dashboard',    href: '/platform/teacher/dashboard',    icon: Icons.Dashboard },
  { label: 'Verification', href: '/platform/teacher/verification', icon: Icons.Verification },
  { label: 'My Courses',   href: '/platform/teacher/courses',      icon: Icons.Courses },
  { label: 'Bookings',     href: '/platform/teacher/bookings',     icon: Icons.Bookings },
  { label: 'Messages',     href: '/platform/messages',             icon: Icons.Message },
  { label: 'Profile',      href: '/platform/teacher/profile',      icon: Icons.Profile },
]

const parentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/platform/parent/dashboard', icon: Icons.Dashboard },
  { label: 'My Children',     href: '/platform/parent/children',  icon: Icons.Children },
  { label: 'Billing',         href: '/platform/parent/billing',   icon: Icons.Billing },
  { label: 'Browse Teachers', href: '/platform/teachers',         icon: Icons.Search },
  { label: 'Messages',        href: '/platform/messages',         icon: Icons.Message },
]

const roleConfig: Record<UserRole, { label: string; portalTag: string; dashHref: string; roleColor: string }> = {
  student: { label: 'Student', portalTag: 'STUDENT PORTAL', dashHref: '/platform/student/dashboard', roleColor: '#22C55E' },
  teacher: { label: 'Teacher', portalTag: 'TEACHER PORTAL', dashHref: '/platform/teacher/dashboard', roleColor: '#F59E0B' },
  parent:  { label: 'Parent',  portalTag: 'PARENT PORTAL',  dashHref: '/platform/parent/dashboard',  roleColor: '#60A5FA' },
  admin:   { label: 'Admin',   portalTag: 'ADMIN PORTAL',   dashHref: '/platform/student/dashboard', roleColor: '#A78BFA' },
}

const navMap: Record<UserRole, NavItem[]> = {
  student: studentNav,
  teacher: teacherNav,
  parent:  parentNav,
  admin:   studentNav,
}

const pageTitles: Record<string, string> = {
  '/platform/student/dashboard':    'Dashboard',
  '/platform/student/bookings':     'My Bookings',
  '/platform/student/lessons':      'My Lessons',
  '/platform/student/profile':      'My Profile',
  '/platform/student/billing':      'Billing',
  '/platform/teacher/dashboard':    'Dashboard',
  '/platform/teacher/verification': 'Verification',
  '/platform/teacher/courses':      'My Courses',
  '/platform/teacher/bookings':     'Bookings',
  '/platform/teacher/profile':      'My Profile',
  '/platform/parent/dashboard':     'Dashboard',
  '/platform/parent/children':      'My Children',
  '/platform/parent/billing':       'Billing',
  '/platform/teachers':             'Browse Teachers',
  '/platform/messages':             'Messages',
}

// ── NavLink ────────────────────────────────────────────────────────────────────

function NavLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={
        active
          ? { background: 'rgba(184,149,42,0.18)', color: '#D4AF50', borderLeft: '3px solid #B8952A' }
          : { color: 'rgba(255,255,255,0.55)', borderLeft: '3px solid transparent' }
      }
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
          ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'
        }
      }}
    >
      <span className="w-5 flex-shrink-0 flex items-center justify-center" style={{ color: active ? '#D4AF50' : 'inherit' }}>
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {active && <span className="ml-auto opacity-50">{Icons.ChevronRight}</span>}
    </Link>
  )
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
// Starts directly with user card — no logo/brand at top

function Sidebar({ nav, role, userName, onSignOut }: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const pathname = usePathname()
  const cfg = roleConfig[role]
  const initial = userName[0]?.toUpperCase() ?? '?'

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen fixed top-0 left-0 z-40"
      style={{
        background: 'linear-gradient(180deg, #0D3D20 0%, #0a2f18 100%)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* User card — top of sidebar, no logo above */}
      <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#fff' }}>{userName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: cfg.roleColor }}
              />
              <p className="text-xs truncate" style={{ color: cfg.roleColor }}>{cfg.label} Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Navigation
        </p>
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return <NavLink key={item.href} item={item} active={active} />
        })}
      </nav>

      {/* Sign out + footer */}
      <div className="px-3 pb-6 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: 'rgba(255,255,255,0.35)', borderLeft: '3px solid transparent' }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.color = '#FCA5A5'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'
            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <span className="w-5 flex-shrink-0 flex items-center justify-center">{Icons.SignOut}</span>
          <span>Sign Out</span>
        </button>
        <p className="text-[9px] px-3 mt-3" style={{ color: 'rgba(255,255,255,0.12)' }}>
          QuranMentorGlobal.com
        </p>
      </div>
    </aside>
  )
}

// ── Notification + Message types ──────────────────────────────────────────────

interface Notif {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  is_read: boolean
  created_at: string
}

interface ConvPreview {
  id: string
  other_name: string
  other_initial: string
  last_message: string | null
  last_message_at: string | null
  unread: boolean
}

// ── Top Bar (Desktop) ──────────────────────────────────────────────────────────

function TopBar({ userName, role, pathname, userId }: {
  userName: string; role: UserRole; pathname: string; userId: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const cfg = roleConfig[role]
  const pageTitle = pageTitles[pathname] ?? 'Platform'
  const initial = userName[0]?.toUpperCase() ?? '?'
  const parts = pathname.split('/').filter(Boolean).slice(1)
  const breadcrumb = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ')

  const [showNotifs, setShowNotifs]   = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [notifs, setNotifs]           = useState<Notif[]>([])
  const [convs, setConvs]             = useState<ConvPreview[]>([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMsgs, setUnreadMsgs]   = useState(0)

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as HTMLElement
      if (!t.closest('[data-dropdown]')) {
        setShowNotifs(false)
        setShowMessages(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load counts on mount
  useEffect(() => {
    if (!userId) return
    loadCounts()

    // Realtime: new notifications
    const sub = supabase
      .channel('notif-count')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
        setUnreadNotifs(n => n + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [userId])

  async function loadCounts() {
    const { count: nc } = await (supabase as any)
      .from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_read', false)
    setUnreadNotifs(nc ?? 0)

    const { count: mc } = await (supabase as any)
      .from('messages').select('id', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', userId)
      .in('conversation_id', await getUserConvIds())
    setUnreadMsgs(mc ?? 0)
  }

  async function getUserConvIds() {
    const { data } = await (supabase as any)
      .from('conversations').select('id')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    return (data ?? []).map((c: any) => c.id)
  }

  async function openNotifs() {
    setShowMessages(false)
    setShowNotifs(v => !v)
    if (!showNotifs) {
      const { data } = await (supabase as any)
        .from('notifications').select('*')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(15)
      setNotifs(data ?? [])
    }
  }

  async function openMessages() {
    setShowNotifs(false)
    setShowMessages(v => !v)
    if (!showMessages) {
      const { data } = await (supabase as any)
        .from('conversations').select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false }).limit(10)

      if (!data) return
      const previews: ConvPreview[] = await Promise.all(data.map(async (c: any) => {
        const otherId = c.participant_1 === userId ? c.participant_2 : c.participant_1
        const { data: p } = await (supabase as any).from('profiles').select('first_name, last_name').eq('id', otherId).single()
        const name = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'User'
        const { count: uc } = await (supabase as any).from('messages').select('id', { count: 'exact', head: true })
          .eq('conversation_id', c.id).eq('is_read', false).neq('sender_id', userId)
        return { id: c.id, other_name: name, other_initial: name[0]?.toUpperCase() ?? '?', last_message: c.last_message, last_message_at: c.last_message_at, unread: (uc ?? 0) > 0 }
      }))
      setConvs(previews)
    }
  }

  async function markNotifRead(id: string, href: string | null) {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadNotifs(n => Math.max(0, n - 1))
    if (href) { setShowNotifs(false); router.push(href) }
  }

  async function markAllNotifsRead() {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadNotifs(0)
  }

  function notifIcon(type: string) {
    if (type === 'booking_request')   return '📋'
    if (type === 'booking_confirmed') return '✅'
    if (type === 'booking_cancelled') return '❌'
    if (type === 'new_message')       return '💬'
    if (type === 'lesson_reminder')   return '⏰'
    return '🔔'
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div
      className="hidden lg:flex items-center h-16 sticky top-0 z-30 px-6"
      style={{ background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(27,94,55,0.08)' }}
    >
      {/* Left */}
      <div className="w-48 flex-shrink-0">
        <p className="text-base font-bold leading-tight" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{pageTitle}</p>
        <p className="text-[11px] mt-0.5" style={{ color: '#9A9A8A' }}>{breadcrumb}</p>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <img src="/logo.png" alt="QMG" className="h-9 w-auto object-contain" />
        <div style={{ lineHeight: 1 }}>
          <p className="font-bold whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#0D3D20', letterSpacing: '-0.3px' }}>
            Quran<span style={{ color: '#B8952A' }}>Mentor</span>Global
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.roleColor }} />
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: cfg.roleColor }}>{cfg.portalTag}</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2">

        {/* ── Notification Bell ── */}
        <div className="relative" data-dropdown>
          <button
            onClick={openNotifs}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: showNotifs ? 'rgba(27,94,55,0.14)' : 'rgba(27,94,55,0.06)', color: '#5A7A6A' }}
            aria-label="Notifications"
          >
            {Icons.Bell}
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: '#B8952A' }}>
                {unreadNotifs > 9 ? '9+' : unreadNotifs}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.1)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)' }}>
                <p className="font-bold text-sm" style={{ color: '#0D3D20' }}>Notifications</p>
                {unreadNotifs > 0 && (
                  <button onClick={markAllNotifsRead} className="text-xs font-medium" style={{ color: '#1B5E37' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-3xl mb-2">🔔</div>
                    <p className="text-sm font-medium" style={{ color: '#0D3D20' }}>No notifications yet</p>
                    <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>We&apos;ll notify you about bookings, lessons and messages.</p>
                  </div>
                ) : notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => markNotifRead(n.id, n.href)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b last:border-0"
                    style={{
                      borderColor: 'rgba(27,94,55,0.05)',
                      background: n.is_read ? 'transparent' : 'rgba(184,149,42,0.05)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.04)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.is_read ? 'transparent' : 'rgba(184,149,42,0.05)' }}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#0D3D20' }}>{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#6B7A6B' }}>{n.body}</p>
                      <p className="text-[10px] mt-1" style={{ color: '#B8B8A8' }}>{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#B8952A' }} />}
                  </button>
                ))}
              </div>

              <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(27,94,55,0.07)' }}>
                <Link href="/platform/messages" onClick={() => setShowNotifs(false)}
                  className="block text-center text-xs font-semibold" style={{ color: '#1B5E37' }}>
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Messages ── */}
        <div className="relative" data-dropdown>
          <button
            onClick={openMessages}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: showMessages ? 'rgba(27,94,55,0.14)' : 'rgba(27,94,55,0.06)', color: '#5A7A6A' }}
            aria-label="Messages"
          >
            {Icons.Message}
            {unreadMsgs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: '#1B5E37' }}>
                {unreadMsgs > 9 ? '9+' : unreadMsgs}
              </span>
            )}
          </button>

          {showMessages && (
            <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.1)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)' }}>
                <p className="font-bold text-sm" style={{ color: '#0D3D20' }}>Messages</p>
                <Link href="/platform/messages" onClick={() => setShowMessages(false)}
                  className="text-xs font-medium" style={{ color: '#1B5E37' }}>
                  Open inbox
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {convs.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-sm font-medium" style={{ color: '#0D3D20' }}>No messages yet</p>
                    <p className="text-xs mt-1" style={{ color: '#9A9A8A' }}>Start a conversation with your teacher or student.</p>
                  </div>
                ) : convs.map(c => (
                  <Link
                    key={c.id}
                    href={`/platform/messages?conv=${c.id}`}
                    onClick={() => setShowMessages(false)}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-0 transition-all"
                    style={{ borderColor: 'rgba(27,94,55,0.05)', background: c.unread ? 'rgba(27,94,55,0.04)' : 'transparent', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = c.unread ? 'rgba(27,94,55,0.04)' : 'transparent' }}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                      {c.other_initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: '#0D3D20' }}>{c.other_name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#9A9A8A' }}>{c.last_message ?? 'Start a conversation'}</p>
                    </div>
                    {c.unread && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#1B5E37' }} />}
                  </Link>
                ))}
              </div>

              <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(27,94,55,0.07)' }}>
                <Link href="/platform/messages" onClick={() => setShowMessages(false)}
                  className="block text-center text-xs font-semibold" style={{ color: '#1B5E37' }}>
                  Open full inbox →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6" style={{ background: 'rgba(27,94,55,0.12)' }} />

        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }} title={userName}>
          {initial}
        </div>
      </div>
    </div>
  )
}

// ── Mobile Top Bar ─────────────────────────────────────────────────────────────

function MobileTopBar({ nav, role, userName, onSignOut }: {
  nav: NavItem[]
  role: UserRole
  userName: string
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const cfg = roleConfig[role]

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 shadow-md"
        style={{ background: '#0D3D20' }}
      >
        {/* Center brand on mobile */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="QMG" className="h-7 w-auto object-contain" />
          <p className="text-sm font-bold" style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>
            Quran<span style={{ color: '#D4AF50' }}>Mentor</span>Global
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }}
          >
            {userName[0]?.toUpperCase() ?? '?'}
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5"
            style={{ background: open ? 'rgba(255,255,255,0.12)' : 'transparent' }}
            aria-label="Menu"
          >
            <span className="block h-0.5 w-5 rounded-full" style={{ background: '#fff', transform: open ? 'translateY(4px) rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
            <span className="block h-0.5 w-5 rounded-full" style={{ background: '#fff', opacity: open ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span className="block h-0.5 w-5 rounded-full" style={{ background: '#fff', transform: open ? 'translateY(-4px) rotate(-45deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)} />
      )}

      <div
        className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col shadow-2xl"
        style={{ background: '#0D3D20', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease' }}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }}>
              {userName[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#fff' }}>{userName}</p>
              <p className="text-xs" style={{ color: cfg.roleColor }}>{cfg.label}</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.6)' }}>✕</button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return <NavLink key={item.href} item={item} active={active} onClick={() => setOpen(false)} />
          })}
        </nav>

        <div className="px-4 pb-8 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { setOpen(false); onSignOut() }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-left transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span className="w-5 flex-shrink-0 flex items-center justify-center">{Icons.SignOut}</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

// ── Loading Screen ─────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4" style={{ borderColor: '#1B5E37', borderTopColor: 'transparent' }} />
        <p className="text-sm font-medium" style={{ color: '#1B5E37' }}>Loading…</p>
      </div>
    </div>
  )
}

// ── Root Layout ────────────────────────────────────────────────────────────────

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole]     = useState<UserRole>('student')
  const [userName, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [ready, setReady]   = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await (supabase as any)
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .single()

      if (!data) { router.push('/auth/login'); return }

      setUserId(user.id)
      setRole((data.role as UserRole) ?? 'student')
      setName(`${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'User')
      setReady(true)
    }
    init()
  }, [])

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (!ready) return <LoadingScreen />

  const nav = navMap[role] ?? studentNav

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Desktop sidebar — w-60 = 240px */}
      <Sidebar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />

      {/* Mobile top bar */}
      <MobileTopBar nav={nav} role={role} userName={userName} onSignOut={handleSignOut} />

      {/* Everything to the right of sidebar */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Sticky top bar (desktop only) */}
        <TopBar userName={userName} role={role} pathname={pathname} userId={userId} />

        {/* Page content — full width, no max-w centering that creates blank space */}
        <main className="flex-1 pt-14 lg:pt-0">
          <div className="px-5 sm:px-7 lg:px-10 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
