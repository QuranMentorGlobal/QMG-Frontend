'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

function getInitials(first: string, last: string) {
  return `${(first[0] ?? '').toUpperCase()}${(last[0] ?? '').toUpperCase()}`
}

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled', 'completed']

function statusStyle(status: string) {
  const map: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    no_show:   'bg-gray-100 text-gray-500',
  }
  return map[status] ?? 'bg-gray-100 text-gray-500'
}

export default function TeacherBookings() {
  const supabase = createClient()
  const router = useRouter()

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data } = await supabase
        .from('bookings')
        .select(`id, status, start_date, session_time, recurrence, price_usd, is_trial, created_at,
          courses ( title, course_type, duration_mins ),
          profiles!bookings_student_id_fkey ( first_name, last_name, avatar_url, country, email )`)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      setBookings((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(bookingId: string, status: string) {
    setUpdating(bookingId)
    await (supabase.from('bookings') as any).update({ status }).eq('id', bookingId)
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    setUpdating(null)
  }

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0D3D20]">Bookings</h1>
        <p className="text-[#1B5E37]/60 text-sm mt-1">Manage all your student booking requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
              activeTab === tab ? 'bg-[#1B5E37] text-white border-[#1B5E37]' : 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#1B5E37]'
            }`}>
            {tab === 'all' ? `All (${bookings.length})` : `${tab} (${bookings.filter(b => b.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-36 w-full" />) :
         filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#0D3D20] font-semibold">No bookings found</p>
          </div>
        ) : filtered.map((b: any) => {
          const student = b.profiles
          const course = b.courses
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-[#D4C99A] p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Student */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[#1B5E37] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(student?.first_name ?? 'S', student?.last_name ?? 'T')}
                  </div>
                  <div>
                    <p className="font-bold text-[#0D3D20]">{student?.first_name} {student?.last_name}</p>
                    <p className="text-xs text-[#1B5E37]/60">{student?.email}</p>
                    <p className="text-xs text-[#1B5E37]/50">{student?.country}</p>
                  </div>
                </div>

                {/* Course info */}
                <div className="flex-1">
                  <p className="font-semibold text-[#0D3D20] text-sm">{course?.title}</p>
                  <p className="text-xs text-[#1B5E37]/60 mt-0.5">
                    {b.session_time} · {b.recurrence} · {course?.duration_mins} min
                  </p>
                  <p className="text-xs text-[#1B5E37]/50">
                    Starts: {b.start_date} · {b.is_trial ? '🎯 Trial' : 'Regular'} · ${b.price_usd}
                  </p>
                </div>

                {/* Status + actions */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${statusStyle(b.status)}`}>
                    {b.status}
                  </span>
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating === b.id}
                        className="bg-[#1B5E37] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0D3D20] transition-colors disabled:opacity-50">
                        {updating === b.id ? '...' : '✓ Confirm'}
                      </button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={updating === b.id}
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50">
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateStatus(b.id, 'completed')} disabled={updating === b.id}
                      className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
