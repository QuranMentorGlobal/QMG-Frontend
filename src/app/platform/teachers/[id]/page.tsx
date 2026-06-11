// src/app/platform/teachers/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { CourseType } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

type TeacherFull = {
  id: string
  first_name: string
  last_name: string
  country: string | null
  avatar_url: string | null
  bio: string | null
  years_experience: number
  specializations: CourseType[]
  teaching_languages: string[]
  hourly_rate_usd: number
  trial_rate_usd: number
  avg_rating: number | null
  total_reviews: number
  total_lessons: number
  ijazah_verified: boolean
}

type TeacherExtra = {
  available_days: string[]
}

type Course = {
  id: string
  title: string
  course_type: CourseType
  description: string | null
  level: string
  age_group: string
  duration_mins: number
  price_usd: number
  trial_price_usd: number
}

type Review = {
  id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
  profiles: { first_name: string; last_name: string; avatar_url: string | null } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COURSE_LABELS: Record<CourseType, string> = {
  noorani_qaida:   'Noorani Qaida',
  tajweed:         'Tajweed',
  hifz:            'Hifz',
  tafseer:         'Tafseer',
  islamic_studies: 'Islamic Studies',
  ijazah:          'Ijazah',
}

const COURSE_ICONS: Record<CourseType, string> = {
  noorani_qaida:   '🔤',
  tajweed:         '🎵',
  hifz:            '📖',
  tafseer:         '🌙',
  islamic_studies: '☪️',
  ijazah:          '🏅',
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function StarRating({ rating, size = 'sm' }: { rating: number | null; size?: 'sm' | 'lg' }) {
  const r = rating ?? 0
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sz} ${star <= Math.round(r) ? 'text-[#B8952A]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeacherProfilePage() {
  const params = useParams()
  const supabase = createClient()
  const teacherId = params.id as string

  const [teacher, setTeacher] = useState<TeacherFull | null>(null)
  const [extra, setExtra] = useState<TeacherExtra | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // 1. Get teacher from public_teachers view
      const { data: t } = await supabase
        .from('public_teachers')
        .select('*')
        .eq('id', teacherId)
        .single()

      if (!t) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setTeacher(t as any)

      // 2. Get teacher_profile for extra fields (available_days)
      const { data: tp } = await supabase
        .from('teacher_profiles')
        .select('id, available_days')
        .eq('user_id', teacherId)
        .single()

      if (tp) {
        setExtra({ available_days: (tp as any).available_days ?? [] })

        // 3. Get courses
        const { data: c } = await supabase
          .from('courses')
          .select('id, title, course_type, description, level, age_group, duration_mins, price_usd, trial_price_usd')
          .eq('teacher_id', tp.id)
          .eq('is_active', true)

        setCourses((c as Course[]) ?? [])
      }

      // 4. Get reviews
      const { data: r } = await supabase
        .from('reviews')
        .select(`
          id, rating, title, body, created_at,
          profiles ( first_name, last_name, avatar_url )
        `)
        .eq('teacher_id', teacherId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10)

      setReviews((r as any) ?? [])
      setLoading(false)
    }

    load()
  }, [teacherId])

  // ── Not found ──
  if (notFound) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-[#0D3D20] mb-2">Teacher not found</h2>
        <p className="text-[#1B5E37]/60 text-sm mb-6">This teacher may no longer be available.</p>
        <Link href="/platform/teachers" className="bg-[#1B5E37] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0D3D20] transition-colors">
          Browse Teachers
        </Link>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl">

      {/* Back link */}
      <Link
        href="/platform/teachers"
        className="inline-flex items-center gap-1.5 text-sm text-[#1B5E37]/60 hover:text-[#1B5E37] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Teachers
      </Link>

      {/* ── Hero Card ── */}
      {loading ? (
        <Skeleton className="h-56 w-full mb-6" />
      ) : teacher && (
        <div className="bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">

            {/* Avatar */}
            <div className="flex-shrink-0">
              {teacher.avatar_url ? (
                <img
                  src={teacher.avatar_url}
                  alt={`${teacher.first_name} ${teacher.last_name}`}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-[#B8952A]/50"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[#B8952A] flex items-center justify-center text-white font-bold text-3xl border-2 border-[#B8952A]/50">
                  {getInitials(teacher.first_name, teacher.last_name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {teacher.first_name} {teacher.last_name}
                </h1>
                {teacher.ijazah_verified && (
                  <span className="bg-[#B8952A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    🏅 Ijazah Certified
                  </span>
                )}
              </div>

              <p className="text-white/60 text-sm mb-3">
                📍 {teacher.country ?? 'International'} &nbsp;·&nbsp; {teacher.years_experience} years experience
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={teacher.avg_rating} size="lg" />
                  <span className="text-white font-bold">
                    {teacher.avg_rating ? teacher.avg_rating.toFixed(1) : 'New'}
                  </span>
                  <span className="text-white/50 text-sm">({teacher.total_reviews} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Lessons Taught', value: teacher.total_lessons.toString() },
                  { label: 'Languages',      value: teacher.teaching_languages.join(', ') },
                  { label: 'Trial Rate',     value: `$${teacher.trial_rate_usd}` },
                  { label: 'Hourly Rate',    value: `$${teacher.hourly_rate_usd}` },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2 text-center">
                    <p className="text-white font-bold text-sm">{s.value}</p>
                    <p className="text-white/50 text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 flex flex-col gap-2 w-full sm:w-auto">
              <Link
                href={`/platform/teachers/${teacherId}/book`}
                className="bg-[#B8952A] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#9A7B22] transition-colors text-center whitespace-nowrap"
              >
                Book Trial Lesson →
              </Link>
              <p className="text-white/40 text-xs text-center">
                First lesson from ${teacher.trial_rate_usd}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          {!loading && teacher?.bio && (
            <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
              <h2 className="font-bold text-[#0D3D20] text-lg mb-3">About</h2>
              <p className="text-[#1B5E37]/70 text-sm leading-relaxed">{teacher.bio}</p>
            </div>
          )}

          {/* Courses */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
            <h2 className="font-bold text-[#0D3D20] text-lg mb-4">Courses Offered</h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : courses.length === 0 ? (
              <p className="text-[#1B5E37]/50 text-sm">No courses listed yet.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F0E8] border border-[#D4C99A]">
                    <div className="text-3xl flex-shrink-0">
                      {COURSE_ICONS[course.course_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0D3D20] text-sm">{course.title}</p>
                      <p className="text-xs text-[#1B5E37]/60 mt-0.5">
                        {COURSE_LABELS[course.course_type]} · {course.level} · {course.age_group}
                      </p>
                      <p className="text-xs text-[#1B5E37]/50 mt-0.5">
                        {course.duration_mins} min per lesson
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#B8952A] text-sm">
                        ${course.price_usd}<span className="text-xs text-[#1B5E37]/50">/hr</span>
                      </p>
                      <p className="text-xs text-[#1B5E37]/50">Trial: ${course.trial_price_usd}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
            <h2 className="font-bold text-[#0D3D20] text-lg mb-4">
              Student Reviews
              {reviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[#1B5E37]/50">({reviews.length})</span>
              )}
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">⭐</div>
                <p className="text-[#1B5E37]/50 text-sm">No reviews yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const studentName = review.profiles
                    ? `${review.profiles.first_name} ${review.profiles.last_name}`
                    : 'Student'
                  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })
                  return (
                    <div key={review.id} className="border-b border-[#F5F0E8] last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        {review.profiles?.avatar_url ? (
                          <img src={review.profiles.avatar_url} alt={studentName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#1B5E37] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(
                              review.profiles?.first_name ?? 'S',
                              review.profiles?.last_name ?? 'T'
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-[#0D3D20]">{studentName}</p>
                            <p className="text-xs text-[#1B5E37]/40">{date}</p>
                          </div>
                          <StarRating rating={review.rating} />
                          {review.title && (
                            <p className="text-sm font-medium text-[#0D3D20] mt-1.5">{review.title}</p>
                          )}
                          {review.body && (
                            <p className="text-xs text-[#1B5E37]/70 mt-1 leading-relaxed">{review.body}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-5">
            <h3 className="font-bold text-[#0D3D20] mb-4">Availability</h3>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {DAY_ORDER.map((day) => {
                  const available = extra?.available_days?.includes(day) ?? false
                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <span className="text-[9px] text-[#1B5E37]/50 font-medium">
                        {DAY_SHORT[day]}
                      </span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        available
                          ? 'bg-[#1B5E37] text-white'
                          : 'bg-[#F5F0E8] text-[#1B5E37]/20'
                      }`}>
                        {available ? '✓' : '·'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="text-[10px] text-[#1B5E37]/40 mt-3 text-center">
              Exact times confirmed on booking
            </p>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-5">
            <h3 className="font-bold text-[#0D3D20] mb-3">Specializations</h3>
            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {teacher?.specializations.map((spec) => (
                  <span key={spec} className="text-xs font-semibold bg-[#F5F0E8] text-[#1B5E37] border border-[#D4C99A] px-2.5 py-1 rounded-full">
                    {COURSE_ICONS[spec]} {COURSE_LABELS[spec]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Book CTA */}
          <div className="bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] rounded-2xl p-5 text-center">
            <p className="text-white font-bold mb-1">Ready to start?</p>
            <p className="text-white/60 text-xs mb-4">
              Book a trial lesson and experience learning firsthand.
            </p>
            <Link
              href={`/platform/teachers/${teacherId}/book`}
              className="block bg-[#B8952A] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#9A7B22] transition-colors"
            >
              Book Trial — ${teacher?.trial_rate_usd ?? '—'}
            </Link>
            <p className="text-white/30 text-[10px] mt-2">No commitment · Cancel anytime</p>
          </div>

          {/* Hadith */}
          <div className="bg-[#F5F0E8] rounded-2xl border border-[#D4C99A] p-5 text-center">
            <p className="text-[#B8952A] text-base font-bold mb-1" style={{ fontFamily: 'serif' }}>
              اقْرَأْ بِاسْمِ رَبِّكَ
            </p>
            <p className="text-[#1B5E37]/60 text-xs">
              "Read in the name of your Lord"
            </p>
            <p className="text-[#B8952A]/60 text-[10px] mt-1">— Surah Al-Alaq 96:1</p>
          </div>
        </div>
      </div>
    </div>
  )
}
