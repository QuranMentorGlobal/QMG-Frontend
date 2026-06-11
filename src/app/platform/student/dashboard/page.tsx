'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    isToday: new Date().toDateString() === d.toDateString(),
    isSoon: d.getTime() - Date.now() < 30 * 60 * 1000 && d.getTime() > Date.now(),
  }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    active: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#E8E4DA] ${className}`} />
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [completedCount, setCompletedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good day')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    async function load() {
      // 1. Auth check
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) {
        router.replace('/auth/login')
        return
      }

      // 2. Profile
      const { data: profRaw } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('id', user.id)
        .single()

      const prof = profRaw as any
      if (prof) {
        setProfile(prof)
        if (prof.role === 'teacher') {
          router.replace('/platform/teacher/dashboard')
          return
        }
      }

      // 3. Get student's booking IDs first
      const { data: myBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          total_lessons,
          lessons_completed,
          student_id,
          courses ( title ),
          teacher_profiles (
            hourly_rate,
            profiles ( full_name, avatar_url )
          )
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setBookings(myBookings ?? [])

      // 4. Get booking IDs to fetch lessons
      const bookingIds = (myBookings ?? []).map((b: any) => b.id)

      if (bookingIds.length > 0) {
        // Upcoming lessons
        const { data: upcomingLessons } = await supabase
          .from('lessons')
          .select(`
            id,
            scheduled_at,
            duration_minutes,
            status,
            meeting_url,
            booking_id,
            bookings (
              courses ( title ),
              teacher_profiles (
                profiles ( full_name, avatar_url )
              )
            )
          `)
          .in('booking_id', bookingIds)
          .eq('status', 'scheduled')
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(10)

        setLessons(upcomingLessons ?? [])

        // Completed count
        const { count } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .in('booking_id', bookingIds)
          .eq('status', 'completed')

        setCompletedCount(count ?? 0)
      }

      setLoading(false)
    }

    load()
  }, [])

  const activeBookings = bookings.filter((b) => b.status === 'active')

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* ── Top Nav ── */}
      <nav className="bg-[#1B5E37] shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#B8952A] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                Quran<span className="text-[#B8952A]">Mentor</span>Global
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
              <Link href="/platform/student/dashboard" className="text-white font-semibold border-b-2 border-[#B8952A] pb-0.5">
                Dashboard
              </Link>
              <Link href="/platform/student/bookings" className="hover:text-white transition-colors">
                My Bookings
              </Link>
              <Link href="/platform/teachers" className="hover:text-white transition-colors">
                Browse Teachers
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#B8952A] flex items-center justify-center text-white font-bold text-sm">
                {profile ? getInitials(profile.full_name) : '?'}
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.replace('/auth/login')
                }}
                className="text-white/70 hover:text-white text-sm transition-colors hidden sm:block"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Greeting */}
        <div className="mb-8">
          {loading ? (
            <Skeleton className="h-8 w-64 mb-2" />
          ) : (
            <>
              <p className="text-[#1B5E37]/60 text-sm font-medium uppercase tracking-wider mb-1">
                {greeting}
              </p>
              <h1 className="text-3xl font-bold text-[#0D3D20]">
                {profile?.full_name?.split(' ')[0] ?? 'Student'} 👋
              </h1>
              <p className="text-[#1B5E37]/70 mt-1 text-sm">
                Here's what's happening with your learning today.
              </p>
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] p-6 shadow-sm">
            {loading ? <Skeleton className="h-12 w-full" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-75">Lessons Completed</p>
                  <p className="text-4xl font-extrabold text-white mt-1">{completedCount}</p>
                </div>
                <span className="text-4xl opacity-80">✅</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#B8952A] to-[#9A7B22] p-6 shadow-sm">
            {loading ? <Skeleton className="h-12 w-full" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white opacity-75">Upcoming Lessons</p>
                  <p className="text-4xl font-extrabold text-white mt-1">{lessons.length}</p>
                </div>
                <span className="text-4xl opacity-80">📅</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#F5F0E8] to-[#EDE7D5] p-6 shadow-sm border border-[#D4C99A]">
            {loading ? <Skeleton className="h-12 w-full" /> : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0D3D20] opacity-75">Active Bookings</p>
                  <p className="text-4xl font-extrabold text-[#0D3D20] mt-1">{activeBookings.length}</p>
                </div>
                <span className="text-4xl opacity-80">📖</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/platform/teachers"
            className="inline-flex items-center gap-2 bg-[#1B5E37] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0D3D20] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Teachers
          </Link>
          <Link
            href="/platform/student/bookings"
            className="inline-flex items-center gap-2 bg-[#B8952A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9A7B22] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Bookings
          </Link>
          <Link
            href="/platform/student/profile"
            className="inline-flex items-center gap-2 bg-white text-[#1B5E37] border border-[#D4C99A] px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-[#1B5E37] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Upcoming Lessons */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0D3D20]">Upcoming Lessons</h2>
              <Link href="/platform/student/lessons" className="text-sm text-[#1B5E37] font-medium hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
              ) : lessons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#D4C99A] p-10 text-center">
                  <div className="text-5xl mb-3">📚</div>
                  <p className="text-[#0D3D20] font-semibold mb-1">No upcoming lessons</p>
                  <p className="text-[#1B5E37]/60 text-sm mb-4">Book a teacher to schedule your first lesson.</p>
                  <Link
                    href="/platform/teachers"
                    className="inline-flex items-center gap-1.5 bg-[#1B5E37] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0D3D20] transition-colors"
                  >
                    Browse Teachers
                  </Link>
                </div>
              ) : (
                lessons.map((lesson: any) => {
                  const dt = formatDateTime(lesson.scheduled_at)
                  const teacherName = lesson.bookings?.teacher_profiles?.profiles?.full_name ?? 'Teacher'
                  const courseName = lesson.bookings?.courses?.title ?? 'Quran Lesson'
                  const avatarUrl = lesson.bookings?.teacher_profiles?.profiles?.avatar_url

                  return (
                    <div
                      key={lesson.id}
                      className={`bg-white rounded-2xl border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow ${dt.isSoon ? 'border-[#B8952A] ring-1 ring-[#B8952A]/30' : 'border-[#D4C99A]'}`}
                    >
                      {/* Date chip */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#F5F0E8] border border-[#D4C99A] flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-[#1B5E37]/60 uppercase">
                          {dt.date.split(' ')[0]}
                        </span>
                        <span className="text-xl font-extrabold text-[#0D3D20] leading-none">
                          {dt.date.split(' ')[1]}
                        </span>
                        <span className="text-[10px] text-[#1B5E37]/60">
                          {dt.date.split(' ')[2]}
                        </span>
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={teacherName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1B5E37] flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(teacherName)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0D3D20] truncate">{courseName}</p>
                        <p className="text-sm text-[#1B5E37]/70 truncate">with {teacherName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-[#1B5E37]/60">{dt.time}</span>
                          <span className="text-xs text-[#1B5E37]/40">·</span>
                          <span className="text-xs text-[#1B5E37]/60">{lesson.duration_minutes} min</span>
                          {dt.isToday && (
                            <span className="text-xs bg-[#1B5E37]/10 text-[#1B5E37] px-2 py-0.5 rounded-full font-medium">
                              Today
                            </span>
                          )}
                          {dt.isSoon && (
                            <span className="text-xs bg-[#B8952A]/15 text-[#B8952A] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                              Starting soon
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Join button */}
                      {lesson.meeting_url && (dt.isToday || dt.isSoon) && (
                        <a
                          href={lesson.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 bg-[#1B5E37] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0D3D20] transition-colors"
                        >
                          Join
                        </a>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* My Teachers */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0D3D20]">My Teachers</h2>
              <Link href="/platform/student/bookings" className="text-sm text-[#1B5E37] font-medium hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#D4C99A] p-8 text-center">
                  <div className="text-4xl mb-2">🎓</div>
                  <p className="text-[#0D3D20] font-semibold text-sm mb-1">No teachers yet</p>
                  <p className="text-[#1B5E37]/60 text-xs">Find a certified Qari to start your journey.</p>
                </div>
              ) : (
                bookings.map((booking: any) => {
                  const teacherName = booking.teacher_profiles?.profiles?.full_name ?? 'Teacher'
                  const courseName = booking.courses?.title ?? 'Course'
                  const avatarUrl = booking.teacher_profiles?.profiles?.avatar_url
                  const progress = booking.total_lessons > 0
                    ? Math.round((booking.lessons_completed / booking.total_lessons) * 100)
                    : 0

                  return (
                    <div key={booking.id} className="bg-white rounded-2xl border border-[#D4C99A] p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={teacherName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#1B5E37] flex items-center justify-center text-white font-bold flex-shrink-0">
                            {getInitials(teacherName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#0D3D20] truncate text-sm">{teacherName}</p>
                          <p className="text-xs text-[#1B5E37]/60 truncate">{courseName}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-[#1B5E37]/60">
                          <span>{booking.lessons_completed} of {booking.total_lessons} lessons</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#F5F0E8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1B5E37] to-[#B8952A] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Hadith card */}
            <div className="mt-4 bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] rounded-2xl p-5 text-center">
              <p className="text-[#B8952A] text-xl font-bold leading-snug mb-2" style={{ fontFamily: 'serif' }}>
                خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
              </p>
              <p className="text-white/80 text-xs leading-relaxed">
                "The best of you are those who learn the Quran and teach it."
              </p>
              <p className="text-[#B8952A]/70 text-xs mt-1">— Sahih Al-Bukhari</p>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
