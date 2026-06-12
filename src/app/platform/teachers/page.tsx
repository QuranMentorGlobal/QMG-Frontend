// src/app/platform/teachers/[id]/book/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CourseType } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

type Teacher = {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  country: string | null
  avg_rating: number | null
  trial_rate_usd: number
  hourly_rate_usd: number
  available_days: string[]
}

type Course = {
  id: string
  title: string
  course_type: CourseType
  level: string
  age_group: string
  duration_mins: number
  price_usd: number
  trial_price_usd: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COURSE_ICONS: Record<CourseType, string> = {
  'Noorani Qaida':   '🔤',
  'Tajweed':         '🎵',
  'Hifz':            '📖',
  'Tafseer':         '🌙',
  'Islamic Studies': '☪️',
  'Ijazah':          '🏅',
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]

const RECURRENCE_OPTIONS = [
  { value: 'once',    label: 'One-time trial',     desc: 'Just this lesson' },
  { value: 'weekly',  label: 'Weekly',              desc: 'Same time every week' },
  { value: 'biweekly', label: 'Every 2 weeks',     desc: 'Every other week' },
]

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ['Choose Course', 'Pick Schedule', 'Confirm']
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-[#1B5E37] text-white' :
                active ? 'bg-[#B8952A] text-white' :
                'bg-[#E8E4DA] text-[#1B5E37]/40'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-[#0D3D20]' : 'text-[#1B5E37]/40'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px w-8 ${done ? 'bg-[#1B5E37]' : 'bg-[#D4C99A]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookTrialPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const teacherId = params.id as string

  // Data
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [step, setStep] = useState(1)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [recurrence, setRecurrence] = useState('once')
  const [startDate, setStartDate] = useState('')
  const [notes, setNotes] = useState('')
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // ── Load teacher + courses ──
  useEffect(() => {
    async function load() {
      // Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }

      // Get teacher from public_teachers view
      const { data: t } = await supabase
        .from('public_teachers')
        .select('*')
        .eq('id', teacherId)
        .single()

      if (!t) {
        router.replace('/platform/teachers')
        return
      }

      // Get available_days from teacher_profiles
      const { data: tp } = await supabase
        .from('teacher_profiles')
        .select('id, available_days')
        .eq('user_id', teacherId)
        .single()

      setTeacher({
        ...(t as any),
        available_days: (tp as any)?.available_days ?? [],
      })

      // Get courses
      if (tp) {
        const { data: c } = await supabase
          .from('courses')
          .select('id, title, course_type, level, age_group, duration_mins, price_usd, trial_price_usd')
          .eq('teacher_id', teacherId)
          .eq('is_active', true)

        setCourses((c as Course[]) ?? [])
        if (c && c.length > 0) setSelectedCourse(c[0] as Course)
      }

      setLoading(false)
    }
    load()
  }, [teacherId])

  // ── Submit booking ──
  async function handleConfirm() {
    if (!selectedCourse || !selectedDay || !selectedTime || !startDate) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/login'); return }

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        student_id:    user.id,
        teacher_id:    teacherId,
        course_id:     selectedCourse.id,
        status:        'pending' as const,
        start_date:    startDate,
        recurrence:    recurrence,
        session_time:  selectedTime,
        duration_mins: selectedCourse.duration_mins,
        price_usd:     selectedCourse.trial_price_usd,
        is_trial:      true,
        student_notes: notes || null,
      }] as any)

    if (bookingError) {
      console.error('Booking error:', bookingError)
      setError(bookingError.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="w-full max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-[#1B5E37] flex items-center justify-center text-4xl mx-auto mb-6">
          ✅
        </div>
        <h1 className="text-2xl font-bold text-[#0D3D20] mb-2">Booking Requested!</h1>
        <p className="text-[#1B5E37]/70 text-sm mb-2">
          Your trial lesson with <strong>{teacher?.first_name} {teacher?.last_name}</strong> has been sent.
        </p>
        <p className="text-[#1B5E37]/50 text-xs mb-8">
          The teacher will confirm your booking shortly. You'll see it in your dashboard.
        </p>
        <div className="bg-[#F5F0E8] rounded-2xl border border-[#D4C99A] p-5 text-left mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#1B5E37]/60">Course</span>
            <span className="font-semibold text-[#0D3D20]">{selectedCourse?.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#1B5E37]/60">Day & Time</span>
            <span className="font-semibold text-[#0D3D20]">{selectedDay} at {selectedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#1B5E37]/60">Start Date</span>
            <span className="font-semibold text-[#0D3D20]">{new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#1B5E37]/60">Trial Price</span>
            <span className="font-bold text-[#B8952A]">${selectedCourse?.trial_price_usd}</span>
          </div>
        </div>
        <Link
          href="/platform/student/dashboard"
          className="inline-block bg-[#1B5E37] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#0D3D20] transition-colors"
        >
          Go to Dashboard →
        </Link>
      </div>
    )
  }

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full">

      {/* Back */}
      <Link
        href={`/platform/teachers/${teacherId}`}
        className="inline-flex items-center gap-1.5 text-sm text-[#1B5E37]/60 hover:text-[#1B5E37] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Profile
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0D3D20]">Book a Trial Lesson</h1>
        <p className="text-[#1B5E37]/60 text-sm mt-1">No commitment — cancel anytime before the lesson.</p>
      </div>

      {/* Steps */}
      <Steps current={step} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main form ── */}
        <div className="lg:col-span-2">

          {/* ── STEP 1: Choose Course ── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
              <h2 className="font-bold text-[#0D3D20] text-lg mb-4">Choose a Course</h2>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : courses.length === 0 ? (
                <p className="text-[#1B5E37]/50 text-sm">This teacher has no active courses yet.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedCourse?.id === course.id
                          ? 'border-[#1B5E37] bg-[#F5F0E8]'
                          : 'border-[#D4C99A] bg-white hover:border-[#1B5E37]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{COURSE_ICONS[course.course_type]}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-[#0D3D20] text-sm">{course.title}</p>
                          <p className="text-xs text-[#1B5E37]/60 mt-0.5">
                            {course.level} · {course.age_group} · {course.duration_mins} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#B8952A] text-sm">Trial: ${course.trial_price_usd}</p>
                          <p className="text-xs text-[#1B5E37]/50">then ${course.price_usd}/hr</p>
                        </div>
                        {selectedCourse?.id === course.id && (
                          <div className="w-5 h-5 rounded-full bg-[#1B5E37] flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!selectedCourse}
                className="mt-6 w-full bg-[#1B5E37] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0D3D20] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue → Pick Schedule
              </button>
            </div>
          )}

          {/* ── STEP 2: Pick Schedule ── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-[#D4C99A] p-6 space-y-6">
              <h2 className="font-bold text-[#0D3D20] text-lg">Pick Your Schedule</h2>

              {/* Day of week */}
              <div>
                <label className="block text-sm font-semibold text-[#0D3D20] mb-3">
                  Preferred Day
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {DAY_ORDER.map((day) => {
                    const available = teacher?.available_days?.includes(day) ?? true
                    const short = day.slice(0, 3)
                    return (
                      <button
                        key={day}
                        onClick={() => available && setSelectedDay(day)}
                        disabled={!available}
                        className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          selectedDay === day
                            ? 'bg-[#1B5E37] text-white border-[#1B5E37]'
                            : available
                            ? 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#1B5E37]'
                            : 'bg-[#F5F0E8] text-[#1B5E37]/25 border-[#F5F0E8] cursor-not-allowed'
                        }`}
                      >
                        {short}
                      </button>
                    )
                  })}
                </div>
                {teacher?.available_days?.length > 0 && (
                  <p className="text-xs text-[#1B5E37]/40 mt-2">
                    Greyed out days are not available for this teacher.
                  </p>
                )}
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-sm font-semibold text-[#0D3D20] mb-3">
                  Preferred Time
                  <span className="ml-2 text-xs font-normal text-[#1B5E37]/50">
                    (your timezone: {timezone})
                  </span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        selectedTime === time
                          ? 'bg-[#B8952A] text-white border-[#B8952A]'
                          : 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#B8952A]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start date */}
              <div>
                <label className="block text-sm font-semibold text-[#0D3D20] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D4C99A] text-sm text-[#0D3D20] focus:outline-none focus:border-[#1B5E37] transition-colors"
                />
              </div>

              {/* Recurrence */}
              <div>
                <label className="block text-sm font-semibold text-[#0D3D20] mb-3">
                  Lesson Frequency
                </label>
                <div className="space-y-2">
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRecurrence(opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        recurrence === opt.value
                          ? 'border-[#1B5E37] bg-[#F5F0E8]'
                          : 'border-[#D4C99A] bg-white hover:border-[#1B5E37]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0D3D20]">{opt.label}</p>
                          <p className="text-xs text-[#1B5E37]/50">{opt.desc}</p>
                        </div>
                        {recurrence === opt.value && (
                          <div className="w-5 h-5 rounded-full bg-[#1B5E37] flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#0D3D20] mb-2">
                  Notes for Teacher <span className="font-normal text-[#1B5E37]/40">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. I'm a complete beginner, I want to learn Tajweed for Salah..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#D4C99A] text-sm text-[#0D3D20] placeholder-[#1B5E37]/30 focus:outline-none focus:border-[#1B5E37] transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-[#D4C99A] text-[#1B5E37] py-3 rounded-xl font-bold text-sm hover:border-[#1B5E37] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedDay || !selectedTime || !startDate) {
                      setError('Please select a day, time, and start date.')
                      return
                    }
                    setError('')
                    setStep(3)
                  }}
                  className="flex-2 flex-1 bg-[#1B5E37] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0D3D20] transition-colors"
                >
                  Continue → Review
                </button>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#D4C99A] p-6 space-y-5">
              <h2 className="font-bold text-[#0D3D20] text-lg">Review & Confirm</h2>

              {/* Summary */}
              <div className="bg-[#F5F0E8] rounded-xl border border-[#D4C99A] p-4 space-y-3">
                {[
                  { label: 'Teacher',     value: `${teacher?.first_name} ${teacher?.last_name}` },
                  { label: 'Course',      value: selectedCourse?.title ?? '' },
                  { label: 'Day',         value: selectedDay },
                  { label: 'Time',        value: `${selectedTime} (${timezone})` },
                  { label: 'Start Date',  value: startDate ? new Date(startDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '' },
                  { label: 'Frequency',   value: RECURRENCE_OPTIONS.find(r => r.value === recurrence)?.label ?? '' },
                  { label: 'Duration',    value: `${selectedCourse?.duration_mins} minutes` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-[#1B5E37]/60">{row.label}</span>
                    <span className="font-semibold text-[#0D3D20] text-right max-w-[60%]">{row.value}</span>
                  </div>
                ))}

                {notes && (
                  <div className="pt-2 border-t border-[#D4C99A]">
                    <p className="text-xs text-[#1B5E37]/60 mb-1">Your notes</p>
                    <p className="text-xs text-[#0D3D20]">{notes}</p>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs">Trial lesson price</p>
                  <p className="text-white text-3xl font-extrabold">${selectedCourse?.trial_price_usd}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Then ${selectedCourse?.price_usd}/hr</p>
                  <p className="text-white/40 text-[10px] mt-1">Cancel before lesson for full refund</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-xs text-center">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-[#D4C99A] text-[#1B5E37] py-3 rounded-xl font-bold text-sm hover:border-[#1B5E37] transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 bg-[#B8952A] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#9A7B22] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Confirm Booking →'
                  )}
                </button>
              </div>

              <p className="text-[10px] text-[#1B5E37]/40 text-center">
                By confirming, you agree to our booking terms. Payment is collected before the lesson.
              </p>
            </div>
          )}
        </div>

        {/* ── Sidebar: Teacher card ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-5">
            <p className="text-xs font-semibold text-[#1B5E37]/50 uppercase tracking-wider mb-3">Your Teacher</p>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : teacher && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {teacher.avatar_url ? (
                    <img src={teacher.avatar_url} alt={teacher.first_name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#1B5E37] flex items-center justify-center text-white font-bold">
                      {getInitials(teacher.first_name, teacher.last_name)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#0D3D20]">{teacher.first_name} {teacher.last_name}</p>
                    <p className="text-xs text-[#1B5E37]/60">{teacher.country ?? 'International'}</p>
                    {teacher.avg_rating && (
                      <p className="text-xs text-[#B8952A] font-semibold">⭐ {teacher.avg_rating.toFixed(1)}</p>
                    )}
                  </div>
                </div>

                {selectedCourse && (
                  <div className="bg-[#F5F0E8] rounded-xl p-3 border border-[#D4C99A]">
                    <p className="text-xs text-[#1B5E37]/60 mb-1">Selected Course</p>
                    <p className="text-sm font-bold text-[#0D3D20]">
                      {COURSE_ICONS[selectedCourse.course_type]} {selectedCourse.title}
                    </p>
                    <p className="text-xs text-[#B8952A] font-bold mt-1">
                      Trial: ${selectedCourse.trial_price_usd}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Trust signals */}
          <div className="bg-[#F5F0E8] rounded-2xl border border-[#D4C99A] p-4 space-y-3">
            {[
              { icon: '🔒', text: 'Safe & secure booking' },
              { icon: '↩️', text: 'Free cancellation before lesson' },
              { icon: '✅', text: 'Verified certified teacher' },
              { icon: '💬', text: 'Direct chat after booking' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs text-[#1B5E37]/70 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
