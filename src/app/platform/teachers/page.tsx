// src/app/platform/teachers/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PublicTeacher, CourseType } from '@/types/database'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COURSE_LABELS: Record<CourseType, string> = {
  'Noorani Qaida':    'Noorani Qaida',
  'Tajweed':          'Tajweed',
  'Hifz':             'Hifz',
  'Tafseer':          'Tafseer',
  'Islamic Studies':  'Islamic Studies',
  'Ijazah':           'Ijazah',
}

const COURSE_ICONS: Record<CourseType, string> = {
  'Noorani Qaida':    '🔤',
  'Tajweed':          '🎵',
  'Hifz':             '📖',
  'Tafseer':          '🌙',
  'Islamic Studies':  '☪️',
  'Ijazah':           '🏅',
}

const ALL_FILTERS: { value: CourseType | 'all'; label: string }[] = [
  { value: 'all',           label: 'All Teachers' },
  { value: 'Noorani Qaida', label: 'Noorani Qaida' },
  { value: 'Tajweed',       label: 'Tajweed' },
  { value: 'Hifz',          label: 'Hifz' },
  { value: 'Tafseer',       label: 'Tafseer' },
  { value: 'Islamic Studies', label: 'Islamic Studies' },
  { value: 'Ijazah',        label: 'Ijazah' },
]

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function StarRating({ rating }: { rating: number | null }) {
  const r = rating ?? 0
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(r) ? 'text-[#B8952A]' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-[#1B5E37]/60 ml-0.5">
        {r > 0 ? r.toFixed(1) : 'New'}
      </span>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

function TeacherCard({ teacher }: { teacher: PublicTeacher }) {
  return (
    <div className="bg-white rounded-2xl border border-[#D4C99A] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

      {/* Top section */}
      <div className="bg-gradient-to-br from-[#1B5E37] to-[#0D3D20] p-5 relative">
        {/* Ijazah badge */}
        {teacher.ijazah_verified && (
          <div className="absolute top-3 right-3 bg-[#B8952A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            🏅 Ijazah
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {teacher.avatar_url ? (
              <img
                src={teacher.avatar_url}
                alt={`${teacher.first_name} ${teacher.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#B8952A]/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#B8952A] flex items-center justify-center text-white font-bold text-xl border-2 border-[#B8952A]/50">
                {getInitials(teacher.first_name, teacher.last_name)}
              </div>
            )}
          </div>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">
              {teacher.first_name} {teacher.last_name}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              {teacher.country ?? 'International'} · {teacher.years_experience}yr exp
            </p>
            <div className="mt-1.5">
              <StarRating rating={teacher.avg_rating} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">

        {/* Bio */}
        {teacher.bio && (
          <p className="text-[#1B5E37]/70 text-xs leading-relaxed mb-3 line-clamp-2">
            {teacher.bio}
          </p>
        )}

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {teacher.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="text-[10px] font-semibold bg-[#F5F0E8] text-[#1B5E37] border border-[#D4C99A] px-2 py-0.5 rounded-full"
            >
              {COURSE_ICONS[spec]} {COURSE_LABELS[spec]}
            </span>
          ))}
          {teacher.specializations.length > 3 && (
            <span className="text-[10px] text-[#1B5E37]/50 px-1 py-0.5">
              +{teacher.specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-xs text-[#1B5E37]/50">🗣️</span>
          <span className="text-xs text-[#1B5E37]/60">
            {teacher.teaching_languages.join(', ')}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4 mt-auto">
          <div className="text-center">
            <p className="text-lg font-extrabold text-[#0D3D20]">{teacher.total_lessons}</p>
            <p className="text-[10px] text-[#1B5E37]/50">Lessons</p>
          </div>
          <div className="w-px h-8 bg-[#D4C99A]" />
          <div className="text-center">
            <p className="text-lg font-extrabold text-[#0D3D20]">{teacher.total_reviews}</p>
            <p className="text-[10px] text-[#1B5E37]/50">Reviews</p>
          </div>
          <div className="w-px h-8 bg-[#D4C99A]" />
          <div className="text-center flex-1">
            <p className="text-lg font-extrabold text-[#B8952A]">${teacher.hourly_rate_usd}</p>
            <p className="text-[10px] text-[#1B5E37]/50">per hour</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2">
          <Link
            href={`/platform/teachers/${teacher.id}`}
            className="flex-1 text-center bg-[#F5F0E8] text-[#1B5E37] border border-[#D4C99A] px-3 py-2 rounded-xl text-xs font-semibold hover:border-[#1B5E37] transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/platform/teachers/${teacher.id}/book`}
            className="flex-1 text-center bg-[#1B5E37] text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#0D3D20] transition-colors"
          >
            Book Trial →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrowseTeachers() {
  const supabase = createClient()

  const [teachers, setTeachers] = useState<PublicTeacher[]>([])
  const [filtered, setFiltered] = useState<PublicTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<CourseType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState<number>(200)
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'lessons'>('rating')

  // ── Fetch teachers ──
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('public_teachers')
        .select('*')
        .order('avg_rating', { ascending: false })

      setTeachers((data as PublicTeacher[]) ?? [])
      setFiltered((data as PublicTeacher[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Filter + sort ──
  useEffect(() => {
    let result = [...teachers]

    // Course filter
    if (activeFilter !== 'all') {
      result = result.filter((t) => t.specializations.includes(activeFilter))
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.first_name.toLowerCase().includes(q) ||
          t.last_name.toLowerCase().includes(q) ||
          t.bio?.toLowerCase().includes(q) ||
          t.specializations.some((s) => COURSE_LABELS[s].toLowerCase().includes(q))
      )
    }

    // Price filter
    result = result.filter((t) => t.hourly_rate_usd <= maxPrice)

    // Sort
    if (sortBy === 'rating') result.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    if (sortBy === 'price_asc') result.sort((a, b) => a.hourly_rate_usd - b.hourly_rate_usd)
    if (sortBy === 'price_desc') result.sort((a, b) => b.hourly_rate_usd - a.hourly_rate_usd)
    if (sortBy === 'lessons') result.sort((a, b) => b.total_lessons - a.total_lessons)

    setFiltered(result)
  }, [teachers, activeFilter, search, maxPrice, sortBy])

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-[#0D3D20] mb-1">
          Browse Teachers
        </h1>
        <p className="text-[#1B5E37]/60 text-sm">
          Find a certified Qari that matches your learning goals.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1B5E37]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, course, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4C99A] bg-white text-sm text-[#0D3D20] placeholder-[#1B5E37]/40 focus:outline-none focus:border-[#1B5E37] transition-colors"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-[#D4C99A] bg-white text-sm text-[#0D3D20] focus:outline-none focus:border-[#1B5E37] transition-colors"
        >
          <option value="rating">Sort: Top Rated</option>
          <option value="price_asc">Sort: Price Low → High</option>
          <option value="price_desc">Sort: Price High → Low</option>
          <option value="lessons">Sort: Most Lessons</option>
        </select>
      </div>

      {/* Course filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ALL_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeFilter === f.value
                ? 'bg-[#1B5E37] text-white border-[#1B5E37]'
                : 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#1B5E37]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Price filter */}
      <div className="flex items-center gap-4 mb-6 bg-white rounded-xl border border-[#D4C99A] px-4 py-3">
        <span className="text-xs font-semibold text-[#0D3D20] whitespace-nowrap">Max Price:</span>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="flex-1 accent-[#1B5E37]"
        />
        <span className="text-sm font-bold text-[#B8952A] w-16 text-right">${maxPrice}/hr</span>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-[#1B5E37]/50 mb-4">
          {filtered.length === 0
            ? 'No teachers found'
            : `${filtered.length} teacher${filtered.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Teachers grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#D4C99A] overflow-hidden">
              <Skeleton className="h-32 rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-[#D4C99A] p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-[#0D3D20] font-semibold mb-1">No teachers found</p>
            <p className="text-[#1B5E37]/60 text-sm mb-4">Try adjusting your filters or search term.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearch(''); setMaxPrice(200) }}
              className="bg-[#1B5E37] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0D3D20] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filtered.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))
        )}
      </div>
    </div>
  )
}
