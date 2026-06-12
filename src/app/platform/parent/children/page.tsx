'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { requireRole } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function statusColor(s: string) {
  if (s === 'scheduled') return 'bg-blue-100 text-blue-700'
  if (s === 'live')      return 'bg-green-100 text-green-700'
  if (s === 'completed') return 'bg-gray-100 text-gray-600'
  if (s === 'cancelled') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-500'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-lg ${className}`} />
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const [children, setChildren]         = useState<Child[]>([])
  const [lessons, setLessons]           = useState<UpcomingLesson[]>([])
  const [stats, setStats]               = useState<DashStats | null>(null)
  const [parentName, setParentName]     = useState('')
  const [loading, setLoading]           = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Auth guard
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      // Parent profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'parent') {
        window.location.href = '/auth/login'
        return
      }
      setParentName(profile.first_name ?? '')

      // Children linked to this parent
      const { data: childLinks } = await supabase
        .from('parent_children')
        .select(`
          child_id,
          profiles!parent_children_child_id_fkey (
            id, first_name, last_name, email, avatar_url, country
          )
        `)
        .eq('parent_id', user.id)

      const childList: Child[] = (childLinks ?? []).map((r: any) => r.profiles).filter(Boolean)
      setChildren(childList)

      const childIds = childList.map(c => c.id)

      if (childIds.length === 0) {
        setStats({ totalChildren: 0, totalLessonsThisMonth: 0, totalSpentThisMonth: 0, nextLessonIn: null })
        setLoading(false)
        return
      }

      // Upcoming lessons for all children
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

      // Stats: lessons this month
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { count: monthCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in('student_id', childIds)
        .eq('status', 'completed')
        .gte('scheduled_at', monthStart.toISOString())

      // Spend this month
      const { data: payments } = await supabase
        .from('payments')
        .select('gross_amount_usd')
        .in('student_id', childIds)
        .eq('status', 'succeeded')
        .gte('created_at', monthStart.toISOString())

      const totalSpent = (payments ?? []).reduce((sum: number, p: any) => sum + (p.gross_amount_usd ?? 0), 0)

      // Next lesson countdown
      let nextLessonIn: string | null = null
      if (upcomingLessons.length > 0) {
        const diff = new Date(upcomingLessons[0].scheduled_at).getTime() - Date.now()
        const hours = Math.floor(diff / 3600000)
        const mins  = Math.floor((diff % 3600000) / 60000)
        if (hours > 24) nextLessonIn = `${Math.floor(hours / 24)}d`
        else if (hours > 0) nextLessonIn = `${hours}h ${mins}m`
        else nextLessonIn = `${mins}m`
      }

      setStats({
        totalChildren: childList.length,
        totalLessonsThisMonth: monthCount ?? 0,
        totalSpentThisMonth: totalSpent,
        nextLessonIn,
      })
      setLoading(false)
    }
    load()
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          {loading
            ? <Skeleton className="h-8 w-64 mb-2" />
            : <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#0D3D20]">
                Assalamu Alaikum, {parentName} 🌙
              </h1>
          }
          <p className="text-[#666] mt-1 text-sm">Here's an overview of your children's Quran learning journey.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              {[
                { label: 'Children Enrolled', value: stats?.totalChildren ?? 0, icon: '👨‍👩‍👧', suffix: '' },
                { label: 'Lessons This Month', value: stats?.totalLessonsThisMonth ?? 0, icon: '📚', suffix: '' },
                { label: 'Spent This Month', value: `$${(stats?.totalSpentThisMonth ?? 0).toFixed(0)}`, icon: '💳', suffix: '', raw: true },
                { label: 'Next Lesson In', value: stats?.nextLessonIn ?? '—', icon: '⏰', suffix: '', raw: true },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#EDE6D6] shadow-sm">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-['Playfair_Display'] text-2xl font-bold text-[#1B5E37]">
                    {s.raw ? s.value : `${s.value}${s.suffix}`}
                  </div>
                  <div className="text-xs text-[#888] mt-1">{s.label}</div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Upcoming lessons — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#EDE6D6] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F0E8]">
                <h2 className="font-semibold text-[#0D3D20] text-base">Upcoming Lessons</h2>
                <a href="/platform/student/lessons" className="text-xs text-[#1B5E37] font-semibold hover:underline">
                  View all →
                </a>
              </div>

              {loading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : lessons.length === 0 ? (
                <div className="py-16 text-center text-[#999]">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="font-medium text-[#555]">No upcoming lessons</p>
                  <p className="text-sm mt-1">Book a session for your child to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F0E8]">
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAF7] transition-colors">
                      {/* Teacher avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                        {lesson.teacher_avatar_url
                          ? <img src={lesson.teacher_avatar_url} alt="" className="w-full h-full object-cover" />
                          : getInitials(lesson.teacher_first_name, lesson.teacher_last_name)
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D3D20] truncate">
                          {lesson.course_title ?? 'Quran Lesson'}
                        </p>
                        <p className="text-xs text-[#888] truncate">
                          {lesson.student_first_name} · Teacher {lesson.teacher_first_name} {lesson.teacher_last_name}
                        </p>
                      </div>
                      {/* Date + status */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-[#333]">{formatDate(lesson.scheduled_at)}</p>
                        <p className="text-xs text-[#888]">{formatTime(lesson.scheduled_at)}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(lesson.status)}`}>
                          {lesson.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Children list — 1/3 width */}
          <div>
            <div className="bg-white rounded-2xl border border-[#EDE6D6] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F0E8]">
                <h2 className="font-semibold text-[#0D3D20] text-base">Your Children</h2>
                <a href="/platform/parent/children" className="text-xs text-[#1B5E37] font-semibold hover:underline">
                  Manage →
                </a>
              </div>

              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : children.length === 0 ? (
                <div className="py-10 px-4 text-center text-[#999]">
                  <div className="text-3xl mb-2">👶</div>
                  <p className="text-sm text-[#555] font-medium">No children linked yet</p>
                  <a
                    href="/platform/parent/children"
                    className="mt-3 inline-block bg-[#1B5E37] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#2A7A4A] transition-colors"
                  >
                    + Add Child
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F0E8]">
                  {children.map(child => (
                    <div key={child.id} className="flex items-center gap-3 px-5 py-4">
                      <div className="w-9 h-9 rounded-full bg-[#B8952A] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {getInitials(child.first_name, child.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D3D20] truncate">
                          {child.first_name} {child.last_name}
                        </p>
                        <p className="text-xs text-[#888] truncate">{child.email}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <a
                      href="/platform/parent/children"
                      className="block w-full text-center bg-[#F5F0E8] text-[#1B5E37] text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#EDE6D6] transition-colors"
                    >
                      + Add Another Child
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="mt-4 bg-white rounded-2xl border border-[#EDE6D6] shadow-sm p-5">
              <h3 className="text-sm font-semibold text-[#0D3D20] mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: '📖 Browse Teachers', href: '/platform/teachers' },
                  { label: '💳 Billing & Payments', href: '/platform/parent/billing' },
                  { label: '📞 Contact Support', href: '/contact' },
                ].map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-[#555] hover:text-[#1B5E37] hover:bg-[#F5F0E8] px-3 py-2 rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
