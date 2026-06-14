'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    no_show:   'bg-gray-100 text-gray-500 border-gray-200',
  }
  return map[status] ?? 'bg-gray-100 text-gray-500 border-gray-200'
}

function getInitials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-cream-dark ${className}`} />
}

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function StudentBookings() {
  const supabase = createClient()
  const router = useRouter()

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data } = await supabase
        .from('bookings')
        .select(`
          id, status, start_date, session_time, recurrence, teacher_id,
          price_usd, is_trial, created_at, duration_mins,
          courses ( title, course_type, duration_mins ),
          profiles!bookings_teacher_id_fkey ( first_name, last_name, avatar_url, country )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setBookings((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    await (supabase.from('bookings') as any).update({ status: 'cancelled' }).eq('id', bookingId)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab)
  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? bookings.length : bookings.filter(b => b.status === tab).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-dark">My Bookings</h1>
        <p className="text-ink-light text-sm mt-1">Track all your lesson bookings and their status.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
              activeTab === tab
                ? 'bg-green-DEFAULT text-white border-green-DEFAULT'
                : 'bg-white text-green-DEFAULT border-green-DEFAULT/30 hover:border-green-DEFAULT'
            }`}>
            {tab === 'all' ? `All (${counts.all})` : `${tab} (${counts[tab]})`}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-36 w-full" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gold/20 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-green-dark font-semibold mb-1">No bookings found</p>
            <p className="text-ink-light text-sm mb-4">
              {activeTab === 'all' ? "You haven't booked any lessons yet." : `No ${activeTab} bookings.`}
            </p>
            <Link href="/platform/teachers"
              className="inline-block bg-green-DEFAULT text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-dark transition-colors">
              Browse Teachers
            </Link>
          </div>
        ) : (
          filtered.map((b: any) => {
            const teacher = b.profiles
            const course = b.courses
            const courseType = course?.course_type as CourseType
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gold/20 p-5 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">

                  {/* Teacher info */}
                  <div className="flex items-center gap-3 flex-1">
                    {teacher?.avatar_url ? (
                      <img src={teacher.avatar_url} alt={teacher.first_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-DEFAULT flex items-center justify-center text-white font-bold flex-shrink-0">
                        {getInitials(teacher?.first_name ?? 'T', teacher?.last_name ?? 'E')}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-green-dark">
                        {teacher?.first_name} {teacher?.last_name}
                      </p>
                      <p className="text-xs text-ink-light">{teacher?.country}</p>
                    </div>
                  </div>

                  {/* Course + schedule */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{COURSE_ICONS[courseType] ?? '📖'}</span>
                      <p className="font-semibold text-green-dark text-sm">{course?.title}</p>
                      {b.is_trial && (
                        <span className="text-[10px] bg-gold/20 text-gold-DEFAULT font-bold px-2 py-0.5 rounded-full">
                          Trial
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-light">
                      📅 {b.session_time} every {b.recurrence}
                    </p>
                    <p className="text-xs text-ink-light">
                      🗓 Starts: {new Date(b.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-ink-light">
                      ⏱ {b.duration_mins ?? course?.duration_mins} min · ${b.price_usd}
                    </p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border capitalize ${statusStyle(b.status)}`}>
                      {b.status}
                    </span>
                    <p className="text-[10px] text-ink-light">
                      Booked {new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/platform/teachers/${b.profiles?.id ?? ''}`}
                        className="text-xs text-green-DEFAULT border border-green-DEFAULT/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-light transition-colors">
                        View Teacher
                      </Link>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          disabled={cancelling === b.id}
                          className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                          {cancelling === b.id ? '...' : 'Cancel'}
                        </button>
                      )}
                      {b.status === 'completed' && (
                        <Link href={`/platform/teachers/${b.teacher_id}`}
                          className="text-xs bg-gold-DEFAULT text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-light transition-colors">
                          Book Again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
