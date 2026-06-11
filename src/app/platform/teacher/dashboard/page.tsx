'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

function getInitials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`
}

export default function TeacherDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ students: 0, todayLessons: 0, pendingBookings: 0, monthEarnings: 0 })
  const [pendingBookings, setPendingBookings] = useState<any[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) { router.replace('/auth/login'); return }
      if ((prof as any).role !== 'teacher') { router.replace('/platform/student/dashboard'); return }
      setProfile(prof)

      // Pending bookings
      const { data: pending } = await supabase
        .from('bookings')
        .select(`id, status, start_date, session_time, price_usd, is_trial, recurrence,
          courses ( title, course_type ),
          profiles!bookings_student_id_fkey ( first_name, last_name, avatar_url, country )`)
        .eq('teacher_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      setPendingBookings((pending as any) ?? [])

      // Upcoming lessons today
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)

      const { data: lessons } = await supabase
        .from('lessons')
        .select(`id, scheduled_at, duration_mins, status, daily_room_url,
          bookings ( courses ( title ), profiles!bookings_student_id_fkey ( first_name, last_name, avatar_url ) )`)
        .eq('teacher_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5)

      setUpcomingLessons((lessons as any) ?? [])

      // Stats
      const { count: studentsCount } = await supabase
        .from('bookings').select('student_id', { count: 'exact', head: true })
        .eq('teacher_id', user.id).eq('status', 'confirmed')

      const { count: pendingCount } = await supabase
        .from('bookings').select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id).eq('status', 'pending')

      const { count: todayCount } = await supabase
        .from('lessons').select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id).eq('status', 'scheduled')
        .gte('scheduled_at', todayStart.toISOString())
        .lte('scheduled_at', todayEnd.toISOString())

      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
      const { data: payments } = await supabase
        .from('payments').select('teacher_payout_usd')
        .eq('teacher_id', user.id).eq('status', 'succeeded')
        .gte('created_at', monthStart.toISOString())

      const monthEarnings = (payments ?? []).reduce((sum: number, p: any) => sum + (p.teacher_payout_usd ?? 0), 0)

      setStats({
        students: studentsCount ?? 0,
        todayLessons: todayCount ?? 0,
        pendingBookings: pendingCount ?? 0,
        monthEarnings,
      })

      setLoading(false)
    }
    load()
  }, [])

  async function handleBooking(bookingId: string, action: 'confirmed' | 'cancelled') {
    await (supabase.from('bookings') as any).update({ status: action }).eq('id', bookingId)
    setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
    setStats(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }))
  }

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        {loading ? <Skeleton className="h-8 w-64" /> : (
          <>
            <p className="text-[#1B5E37]/60 text-sm font-medium uppercase tracking-wider mb-1">{greeting}</p>
            <h1 className="text-3xl font-bold text-[#0D3D20]">
              {profile?.first_name} 🌙
            </h1>
            <p className="text-[#1B5E37]/60 text-sm mt-1">Manage your students, bookings and lessons.</p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Students',   value: stats.students,        icon: '👨‍🎓', gold: false },
          { label: "Today's Lessons",   value: stats.todayLessons,    icon: '📅', gold: false },
          { label: 'Pending Bookings',  value: stats.pendingBookings, icon: '⏳', gold: stats.pendingBookings > 0 },
          { label: 'Earnings (Month)',  value: `$${stats.monthEarnings.toFixed(0)}`, icon: '💰', gold: true },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${s.gold ? 'bg-gradient-to-br from-[#B8952A] to-[#9A7B22] border-transparent' : 'bg-white border-[#D4C99A]'}`}>
            {loading ? <Skeleton className="h-12 w-full" /> : (
              <>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`text-2xl font-extrabold ${s.gold ? 'text-white' : 'text-[#0D3D20]'}`}>{s.value}</div>
                <div className={`text-xs mt-0.5 ${s.gold ? 'text-white/70' : 'text-[#1B5E37]/50'}`}>{s.label}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Bookings */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0D3D20]">Pending Bookings</h2>
            <Link href="/platform/teacher/bookings" className="text-sm text-[#1B5E37] hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {loading ? [1,2].map(i => <Skeleton key={i} className="h-28 w-full" />) :
             pendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D4C99A] p-8 text-center">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-[#1B5E37]/50 text-sm">No pending bookings</p>
              </div>
            ) : pendingBookings.map((b: any) => {
              const student = b.profiles
              const course = b.courses
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-[#D4C99A] p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B5E37] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {getInitials(student?.first_name ?? 'S', student?.last_name ?? 'T')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0D3D20] text-sm">{student?.first_name} {student?.last_name}</p>
                      <p className="text-xs text-[#1B5E37]/60">{course?.title} · {b.is_trial ? 'Trial' : 'Regular'}</p>
                      <p className="text-xs text-[#1B5E37]/50">{b.session_time} · {b.recurrence} · ${b.price_usd}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Pending</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBooking(b.id, 'confirmed')}
                      className="flex-1 bg-[#1B5E37] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#0D3D20] transition-colors"
                    >
                      ✓ Confirm
                    </button>
                    <button
                      onClick={() => handleBooking(b.id, 'cancelled')}
                      className="flex-1 bg-red-50 text-red-600 border border-red-200 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Upcoming Lessons */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#0D3D20]">Upcoming Lessons</h2>
          </div>
          <div className="space-y-3">
            {loading ? [1,2].map(i => <Skeleton key={i} className="h-20 w-full" />) :
             upcomingLessons.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D4C99A] p-8 text-center">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-[#1B5E37]/50 text-sm">No upcoming lessons</p>
              </div>
            ) : upcomingLessons.map((l: any) => {
              const dt = new Date(l.scheduled_at)
              const student = l.bookings?.profiles
              const isToday = new Date().toDateString() === dt.toDateString()
              return (
                <div key={l.id} className={`bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm ${isToday ? 'border-[#B8952A]' : 'border-[#D4C99A]'}`}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F5F0E8] border border-[#D4C99A] flex flex-col items-center justify-center">
                    <span className="text-[10px] text-[#1B5E37]/50">{dt.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                    <span className="text-lg font-extrabold text-[#0D3D20] leading-none">{dt.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0D3D20] text-sm truncate">{l.bookings?.courses?.title}</p>
                    <p className="text-xs text-[#1B5E37]/60">with {student?.first_name} {student?.last_name}</p>
                    <p className="text-xs text-[#1B5E37]/50">{dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {l.duration_mins} min</p>
                  </div>
                  {l.daily_room_url && isToday && (
                    <a href={l.daily_room_url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 bg-[#1B5E37] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0D3D20] transition-colors">
                      Start
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {/* Hadith */}
          <div className="mt-4 bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] rounded-2xl p-5 text-center">
            <p className="text-[#B8952A] text-lg font-bold mb-1" style={{ fontFamily: 'serif' }}>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
            <p className="text-white/70 text-xs">"The best of you are those who learn the Quran and teach it."</p>
            <p className="text-[#B8952A]/60 text-[10px] mt-1">— Sahih Al-Bukhari</p>
          </div>
        </section>
      </div>
    </div>
  )
}
