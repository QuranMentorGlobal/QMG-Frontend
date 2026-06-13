'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Stats {
  totalStudents: number
  todayLessons: number
  pendingBookings: number
  monthlyEarnings: number
}

interface Booking {
  id: string
  student_name: string
  course_title: string
  start_date: string
  session_time: string
  status: string
  price_usd: number
  is_trial: boolean
  student_notes: string | null
}

interface Lesson {
  id: string
  scheduled_at: string
  status: string
  student_name: string
  course_title: string
  duration_mins: number
}

export default function TeacherDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, todayLessons: 0, pendingBookings: 0, monthlyEarnings: 0 })
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const teacherId = user.id
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Pending bookings with student info
    const { data: bookingsData } = await supabase
      .from('teacher_bookings_view')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('status', 'pending')
      .order('start_date', { ascending: true })

    // Upcoming lessons
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, scheduled_at, status, duration_mins, teacher_notes')
      .eq('teacher_id', teacherId)
      .in('status', ['scheduled', 'live'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5)

    // Stats
    const { count: studentCount } = await supabase
      .from('bookings')
      .select('student_id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'confirmed')

    const { count: todayCount } = await supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .gte('scheduled_at', `${today}T00:00:00`)
      .lte('scheduled_at', `${today}T23:59:59`)

    const { count: pendingCount } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('status', 'pending')

    const { data: earningsData } = await supabase
      .from('payments')
      .select('teacher_payout_usd')
      .eq('teacher_id', teacherId)
      .eq('status', 'succeeded')
      .gte('created_at', monthStart)

    const monthlyEarnings = (earningsData || []).reduce((sum: number, p: any) => sum + (p.teacher_payout_usd || 0), 0)

    setStats({
      totalStudents: studentCount || 0,
      todayLessons: todayCount || 0,
      pendingBookings: pendingCount || 0,
      monthlyEarnings,
    })

    setPendingBookings((bookingsData as any) || [])

    // Map lessons with student name from bookings join
    setUpcomingLessons(
      (lessonsData || []).map((l: any) => ({
        id: l.id,
        scheduled_at: l.scheduled_at,
        status: l.status,
        student_name: 'Student',
        course_title: 'Lesson',
        duration_mins: l.duration_mins,
      }))
    )

    setLoading(false)
  }

  async function handleBookingAction(bookingId: string, action: 'confirmed' | 'cancelled') {
    setActionLoading(bookingId + action)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: action,
          ...(action === 'cancelled' ? { cancel_reason: 'Declined by teacher' } : {}),
        })
        .eq('id', bookingId)

      if (error) throw error

      // Remove from pending list
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
      setStats(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }))

      showToast(
        action === 'confirmed' ? '✅ Booking confirmed! Student will be notified.' : '❌ Booking declined.',
        'success'
      )
    } catch (err: any) {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: 'bg-blue-50 text-blue-700' },
    { label: "Today's Lessons", value: stats.todayLessons, icon: '📖', color: 'bg-green-50 text-green-700' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Monthly Earnings', value: `$${stats.monthlyEarnings.toFixed(0)}`, icon: '💰', color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          Teacher Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Assalamu Alaikum! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
            ))
          : statCards.map(card => (
              <div key={card.label} className={`rounded-2xl p-5 ${card.color}`}>
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{card.label}</div>
              </div>
            ))}
      </div>

      {/* Pending Bookings */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Pending Booking Requests
          {pendingBookings.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingBookings.length}
            </span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : pendingBookings.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-medium">No pending requests</p>
            <p className="text-sm mt-1">New booking requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {(booking as any).student_first_name
                          ? `${(booking as any).student_first_name} ${(booking as any).student_last_name || ''}`
                          : 'New Student'}
                      </span>
                      {booking.is_trial && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Trial
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(booking as any).course_title || 'Course'} &middot; {formatDate(booking.start_date)} &middot; {booking.session_time?.slice(0, 5)}
                    </div>
                    <div className="text-sm font-semibold text-green-700 mt-1">
                      ${booking.price_usd}
                    </div>
                    {booking.student_notes && (
                      <div className="text-xs text-gray-400 mt-1 italic">"{booking.student_notes}"</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                      disabled={actionLoading !== null}
                      className="flex-1 md:flex-none px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                      style={{ backgroundColor: actionLoading === booking.id + 'confirmed' ? '#aaa' : '#1B5E37' }}
                    >
                      {actionLoading === booking.id + 'confirmed' ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                      disabled={actionLoading !== null}
                      className="flex-1 md:flex-none px-5 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      {actionLoading === booking.id + 'cancelled' ? 'Declining...' : 'Decline'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Lessons */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Lessons</h2>

        {loading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : upcomingLessons.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">📅</div>
            <p className="font-medium">No upcoming lessons</p>
            <p className="text-sm mt-1">Confirmed bookings will generate lessons here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingLessons.map(lesson => (
              <div key={lesson.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{lesson.student_name}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(lesson.scheduled_at)} at {formatTime(lesson.scheduled_at)} &middot; {lesson.duration_mins} min
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  lesson.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {lesson.status === 'live' ? '🔴 Live' : 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
