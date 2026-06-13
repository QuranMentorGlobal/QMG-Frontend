'use client'

import DashboardBanner from '@/components/platform/DashboardBanner'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Child {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  country: string | null
}

interface UpcomingLesson {
  id: string
  scheduled_at: string
  duration_mins: number
  status: string
  student_first_name: string
  student_last_name: string
  teacher_first_name: string
  teacher_last_name: string
  teacher_avatar_url: string | null
  course_title: string | null
}

interface DashStats {
  totalChildren: number
  totalLessonsThisMonth: number
  totalSpentThisMonth: number
  nextLessonIn: string | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-2xl ${className}`} />
}

// ── KPI Card — same pattern as student + teacher ───────────────────────────────

function KpiCard({ label, value, icon, gradient, iconBg, loading }: {
  label: string; value: string | number; icon: string
  gradient: string; iconBg: string; loading: boolean
}) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-default"
      style={{ background: gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          {value}
        </div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{label}</div>
      </div>
    </div>
  )
}

// ── Quick Action — same pattern ────────────────────────────────────────────────

function QuickAction({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-150"
      style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color }}>
        {icon}
      </span>
      <span className="text-xs font-semibold" style={{ color: '#0D3D20' }}>{label}</span>
    </Link>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ emoji, title, sub, cta, ctaHref }: {
  emoji: string; title: string; sub: string; cta?: string; ctaHref?: string
}) {
  return (
    <div className="rounded-2xl p-10 text-center"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(27,94,55,0.15)' }}>
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-semibold text-sm" style={{ color: '#1B5E37' }}>{title}</p>
      <p className="text-xs mt-1.5" style={{ color: '#8A9A8A' }}>{sub}</p>
      {cta && ctaHref && (
        <Link href={ctaHref}
          className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: '#1B5E37' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}>
          {cta}
        </Link>
      )}
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    scheduled: { bg: 'rgba(99,102,241,0.1)',  color: '#6366F1' },
    live:      { bg: 'rgba(34,197,94,0.1)',   color: '#16A34A' },
    completed: { bg: 'rgba(27,94,55,0.08)',   color: '#1B5E37' },
    cancelled: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
  }
  const s = map[status] ?? { bg: 'rgba(0,0,0,0.06)', color: '#666' }
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
      style={{ background: s.bg, color: s.color }}>
      {status.toUpperCase()}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [lessons, setLessons]   = useState<UpcomingLesson[]>([])
  const [stats, setStats]       = useState<DashStats | null>(null)
  const [parentName, setParentName] = useState('')
  const [loading, setLoading]   = useState(true)
  const supabase = createClient()
  const greeting = getGreeting()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: _pd } = await (supabase as any)
        .from('profiles').select('first_name, last_name, role').eq('id', user.id).single()
      const profile = _pd as { role: string; first_name: string | null; last_name: string | null } | null

      if (profile?.role !== 'parent') { window.location.href = '/auth/login'; return }
      setParentName(profile.first_name ?? '')

      const { data: childLinks } = await supabase
        .from('parent_children')
        .select(`child_id, profiles!parent_children_child_id_fkey (id, first_name, last_name, email, avatar_url, country)`)
        .eq('parent_id', user.id)

      const childList: Child[] = (childLinks ?? []).map((r: any) => r.profiles).filter(Boolean)
      setChildren(childList)

      const childIds = childList.map(c => c.id)
      if (childIds.length === 0) {
        setStats({ totalChildren: 0, totalLessonsThisMonth: 0, totalSpentThisMonth: 0, nextLessonIn: null })
        setLoading(false)
        return
      }

      const now = new Date().toISOString()
      const { data: upcomingRaw } = await supabase
        .from('lessons')
        .select(`
          id, scheduled_at, duration_mins, status,
          student:profiles!lessons_student_id_fkey (first_name, last_name),
          teacher:profiles!lessons_teacher_id_fkey (first_name, last_name, avatar_url),
          booking:bookings!lessons_booking_id_fkey (
            course:courses!bookings_course_id_fkey (title)
          )
        `)
        .in('student_id', childIds)
        .in('status', ['scheduled', 'live'])
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(8)

      const upcomingLessons: UpcomingLesson[] = (upcomingRaw ?? []).map((r: any) => ({
        id: r.id,
        scheduled_at: r.scheduled_at,
        duration_mins: r.duration_mins,
        status: r.status,
        student_first_name: r.student?.first_name ?? '',
        student_last_name: r.student?.last_name ?? '',
        teacher_first_name: r.teacher?.first_name ?? '',
        teacher_last_name: r.teacher?.last_name ?? '',
        teacher_avatar_url: r.teacher?.avatar_url ?? null,
        course_title: r.booking?.course?.title ?? null,
      }))
      setLessons(upcomingLessons)

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

      const { count: monthCount } = await supabase
        .from('lessons').select('id', { count: 'exact', head: true })
        .in('student_id', childIds).eq('status', 'completed').gte('scheduled_at', monthStart.toISOString())

      const { data: payments } = await supabase
        .from('payments').select('gross_amount_usd')
        .in('student_id', childIds).eq('status', 'succeeded').gte('created_at', monthStart.toISOString())

      const totalSpent = (payments ?? []).reduce((sum: number, p: any) => sum + (p.gross_amount_usd ?? 0), 0)

      let nextLessonIn: string | null = null
      if (upcomingLessons.length > 0) {
        const diff = new Date(upcomingLessons[0].scheduled_at).getTime() - Date.now()
        const hours = Math.floor(diff / 3600000)
        const mins  = Math.floor((diff % 3600000) / 60000)
        if (hours > 24) nextLessonIn = `${Math.floor(hours / 24)}d`
        else if (hours > 0) nextLessonIn = `${hours}h ${mins}m`
        else nextLessonIn = `${mins}m`
      }

      setStats({ totalChildren: childList.length, totalLessonsThisMonth: monthCount ?? 0, totalSpentThisMonth: totalSpent, nextLessonIn })
      setLoading(false)
    }
    load()
  }, [])

  const kpiCards = [
    { label: 'Children Enrolled',   value: stats?.totalChildren ?? 0,                          icon: '👨‍👩‍👧', gradient: 'linear-gradient(135deg, #E8F5EE 0%, #D4EDDA 100%)', iconBg: 'rgba(27,94,55,0.12)' },
    { label: 'Lessons This Month',  value: stats?.totalLessonsThisMonth ?? 0,                  icon: '📚',    gradient: 'linear-gradient(135deg, #FFF8E8 0%, #FDEFC9 100%)', iconBg: 'rgba(184,149,42,0.12)' },
    { label: 'Spent This Month',    value: `$${(stats?.totalSpentThisMonth ?? 0).toFixed(0)}`, icon: '💳',    gradient: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', iconBg: 'rgba(99,102,241,0.12)' },
    { label: 'Next Lesson In',      value: stats?.nextLessonIn ?? '—',                         icon: '⏰',    gradient: 'linear-gradient(135deg, #F5F0FF 0%, #EDE9FE 100%)', iconBg: 'rgba(139,92,246,0.12)' },
  ]

  return (
    <div>

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
          {greeting}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          {loading ? 'Welcome back' : `Assalamu Alaikum, ${parentName}`} 🌙
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
          Here&apos;s an overview of your children&apos;s Quran learning journey.
        </p>
      </div>

      {/* Banner */}
      <DashboardBanner role="parent" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(card => (
          <KpiCard key={card.label} loading={loading} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon="👨‍👩‍👧" label="My Children"      href="/platform/parent/children" color="rgba(27,94,55,0.08)" />
          <QuickAction icon="🔍"    label="Browse Teachers" href="/platform/teachers"         color="rgba(184,149,42,0.10)" />
          <QuickAction icon="💳"    label="Billing"         href="/platform/parent/billing"   color="rgba(99,102,241,0.10)" />
          <QuickAction icon="📞"    label="Support"         href="/contact"                   color="rgba(139,92,246,0.10)" />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Upcoming Lessons — 2 cols */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Upcoming Lessons
            </h2>
            <Link href="/platform/parent/children" className="text-xs font-medium" style={{ color: '#1B5E37' }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
          ) : lessons.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="No upcoming lessons"
              sub="Book a teacher for your child to get started."
              cta="Browse Teachers"
              ctaHref="/platform/teachers"
            />
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <div
                  key={lesson.id}
                  className="rounded-2xl p-4 flex items-center gap-4 transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  {/* Teacher avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1B5E37, #2A7A4A)', color: '#fff' }}>
                    {lesson.teacher_avatar_url
                      ? <img src={lesson.teacher_avatar_url} alt="" className="w-full h-full object-cover" />
                      : getInitials(lesson.teacher_first_name, lesson.teacher_last_name)
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0D3D20' }}>
                      {lesson.course_title ?? 'Quran Lesson'}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#8A9A8A' }}>
                      {lesson.student_first_name} · with {lesson.teacher_first_name} {lesson.teacher_last_name}
                    </p>
                  </div>

                  {/* Date + status */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-xs font-semibold" style={{ color: '#0D3D20' }}>{formatDate(lesson.scheduled_at)}</p>
                    <p className="text-xs" style={{ color: '#8A9A8A' }}>{formatTime(lesson.scheduled_at)}</p>
                    <StatusBadge status={lesson.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right col — children + hadith */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Your Children
            </h2>
            <Link href="/platform/parent/children" className="text-xs font-medium" style={{ color: '#1B5E37' }}>
              Manage →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : children.length === 0 ? (
            <EmptyState
              emoji="👶"
              title="No children linked yet"
              sub="Add your child's account to monitor their progress."
              cta="+ Add Child"
              ctaHref="/platform/parent/children"
            />
          ) : (
            <div className="space-y-3">
              {children.map(child => (
                <div
                  key={child.id}
                  className="rounded-2xl p-4 flex items-center gap-3 transition-all"
                  style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)', color: '#fff' }}>
                    {getInitials(child.first_name, child.last_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#0D3D20' }}>
                      {child.first_name} {child.last_name}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#9A9A8A' }}>{child.email}</p>
                  </div>
                  <Link href="/platform/teachers"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                    style={{ background: 'rgba(27,94,55,0.08)', color: '#1B5E37' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.08)'; (e.currentTarget as HTMLElement).style.color = '#1B5E37' }}>
                    Book
                  </Link>
                </div>
              ))}

              <Link href="/platform/parent/children"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'transparent', border: '2px dashed rgba(27,94,55,0.2)', color: '#1B5E37' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                + Add Another Child
              </Link>
            </div>
          )}

          {/* Quranic reminder — same as other dashboards */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: 'linear-gradient(135deg, #0D3D20 0%, #1B5E37 100%)' }}>
            <p className="text-lg mb-2" style={{ fontFamily: "'Amiri', serif", color: '#D4AF50', direction: 'rtl' }}>
              وَمَا يَعْلَمُ جُنُودَ رَبِّكَ إِلَّا هُوَ
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              &ldquo;The greatest gift a parent can give their child is a good education.&rdquo;
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
