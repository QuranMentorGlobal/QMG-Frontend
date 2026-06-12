'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CourseType } from '@/types/database'

const COURSE_ICONS: Record<CourseType, string> = {
  'Noorani Qaida': '🔤',
  'Tajweed': '🎵',
  'Hifz': '📖',
  'Tafseer': '🌙',
  'Islamic Studies': '☪️',
  'Ijazah': '🏅',
}

function statusStyle(status: string) {
  const map: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    live:      'bg-green-100 text-green-700 animate-pulse',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-500',
    no_show:   'bg-gray-100 text-gray-500',
  }
  return map[status] ?? 'bg-gray-100 text-gray-500'
}

function getInitials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cream-dark ${className}`} />
}

const TABS = ['upcoming', 'completed', 'cancelled']

export default function StudentLessons() {
  const supabase = createClient()
  const router = useRouter()

  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('student_id', user.id)

      const bookingIds = (bookings ?? []).map((b: any) => b.id)
      if (bookingIds.length === 0) { setLoading(false); return }

      const { data } = await supabase
        .from('lessons')
        .select(`
          id, scheduled_at, duration_mins, status,
          daily_room_url, teacher_notes, homework, surahs_covered,
          booking_id,
          bookings (
            courses ( title, course_type ),
            profiles!bookings_teacher_id_fkey ( first_name, last_name, avatar_url )
          )
        `)
        .in('booking_id', bookingIds)
        .order('scheduled_at', { ascending: false })

      setLessons((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const filtered = lessons.filter(l => {
    const dt = new Date(l.scheduled_at)
    if (activeTab === 'upcoming') return (l.status === 'scheduled' || l.status === 'live') && dt >= new Date(now.getTime() - 3600000)
    if (activeTab === 'completed') return l.status === 'completed'
    if (activeTab === 'cancelled') return l.status === 'cancelled' || l.status === 'no_show'
    return true
  })

  const upcomingCount = lessons.filter(l => l.status === 'scheduled' || l.status === 'live').length
  const completedCount = lessons.filter(l => l.status === 'completed').length
  const cancelledCount = lessons.filter(l => l.status === 'cancelled' || l.status === 'no_show').length

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-dark">My Lessons</h1>
        <p className="text-ink-light text-sm mt-1">View all your scheduled and past lessons.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Upcoming',  value: upcomingCount,  icon: '📅', color: 'bg-blue-50 border-blue-200' },
          { label: 'Completed', value: completedCount, icon: '✅', color: 'bg-emerald-50 border-emerald-200' },
          { label: 'Cancelled', value: cancelledCount, icon: '❌', color: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold text-green-dark">{s.value}</div>
            <div className="text-xs text-ink-light">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
              activeTab === tab
                ? 'bg-green-DEFAULT text-white border-green-DEFAULT'
                : 'bg-white text-green-DEFAULT border-green-DEFAULT/30 hover:border-green-DEFAULT'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gold/20 p-12 text-center">
            <div className="text-5xl mb-3">
              {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '📚' : '❌'}
            </div>
            <p className="text-green-dark font-semibold">No {activeTab} lessons</p>
          </div>
        ) : (
          filtered.map((l: any) => {
            const dt = new Date(l.scheduled_at)
            const teacher = l.bookings?.profiles
            const course = l.bookings?.courses
            const courseType = course?.course_type as CourseType
            const isToday = new Date().toDateString() === dt.toDateString()
            const isSoon = dt.getTime() - Date.now() < 30 * 60 * 1000 && dt.getTime() > Date.now()
            const isLive = l.status === 'live'

            return (
              <div key={l.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-card ${
                isLive ? 'border-green-DEFAULT ring-2 ring-green-DEFAULT/20' :
                isSoon ? 'border-gold-DEFAULT' : 'border-gold/20'
              }`}>
                <div className="flex flex-col sm:flex-row gap-4">

                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-cream border border-gold/20 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-ink-light uppercase">
                      {dt.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                    <span className="text-2xl font-extrabold text-green-dark leading-none">{dt.getDate()}</span>
                    <span className="text-[10px] text-ink-light">
                      {dt.toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    {teacher?.avatar_url ? (
                      <img src={teacher.avatar_url} alt={teacher.first_name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-DEFAULT flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(teacher?.first_name ?? 'T', teacher?.last_name ?? 'E')}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-green-dark text-sm">
                          {COURSE_ICONS[courseType] ?? '📖'} {course?.title}
                        </p>
                        {isLive && <span className="text-[10px] bg-green-DEFAULT text-white px-2 py-0.5 rounded-full font-bold animate-pulse">🔴 LIVE</span>}
                        {isToday && !isLive && <span className="text-[10px] bg-green-light text-green-DEFAULT px-2 py-0.5 rounded-full font-semibold">Today</span>}
                        {isSoon && <span className="text-[10px] bg-gold/20 text-gold-DEFAULT px-2 py-0.5 rounded-full font-semibold">Starting soon</span>}
                      </div>
                      <p className="text-xs text-ink-light">with {teacher?.first_name} {teacher?.last_name}</p>
                      <p className="text-xs text-ink-light">
                        {dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {l.duration_mins} min
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${statusStyle(l.status)}`}>
                      {l.status}
                    </span>
                    {l.daily_room_url && (isToday || isLive || isSoon) && (
                      <a href={l.daily_room_url} target="_blank" rel="noopener noreferrer"
                        className="bg-green-DEFAULT text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-green-dark transition-colors">
                        Join Lesson →
                      </a>
                    )}
                    {l.homework && (
                      <div className="text-xs text-ink-light bg-cream rounded-lg px-3 py-1.5 max-w-xs">
                        📝 <span className="font-medium">Homework:</span> {l.homework}
                      </div>
                    )}
                    {l.surahs_covered?.length > 0 && (
                      <div className="text-xs text-ink-light">
                        📖 {l.surahs_covered.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {l.teacher_notes && (
                  <div className="mt-3 pt-3 border-t border-cream-dark">
                    <p className="text-xs text-ink-light">
                      <span className="font-semibold text-green-dark">Teacher's note:</span> {l.teacher_notes}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
