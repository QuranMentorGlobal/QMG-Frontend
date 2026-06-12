'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentRecord {
  id: string
  created_at: string
  gross_amount_usd: number
  platform_fee_usd: number
  status: string
  method: string
  student_name: string
  course_title: string | null
  teacher_name: string
  is_trial: boolean
}

type Filter = 'all' | 'succeeded' | 'pending' | 'refunded'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function statusBadge(s: string) {
  if (s === 'succeeded') return 'bg-green-100 text-green-700'
  if (s === 'pending')   return 'bg-yellow-100 text-yellow-700'
  if (s === 'failed')    return 'bg-red-100 text-red-600'
  if (s === 'refunded')  return 'bg-blue-100 text-blue-600'
  return 'bg-gray-100 text-gray-500'
}

function methodIcon(m: string) {
  if (m === 'stripe')   return '💳'
  if (m === 'jazzcash') return '📱'
  return '💰'
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-lg ${className}`} />
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParentBillingPage() {
  const [payments, setPayments]   = useState<PaymentRecord[]>([])
  const [filtered, setFiltered]   = useState<PaymentRecord[]>([])
  const [filter, setFilter]       = useState<Filter>('all')
  const [loading, setLoading]     = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const [thisMonth, setThisMonth] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'parent') { window.location.href = '/auth/login'; return }

      // Children IDs
      const { data: links } = await supabase
        .from('parent_children')
        .select('child_id')
        .eq('parent_id', user.id)

      const childIds = (links ?? []).map((r: any) => r.child_id)

      if (childIds.length === 0) {
        setLoading(false)
        return
      }

      // Payments for all children
      const { data: raw } = await supabase
        .from('payments')
        .select(`
          id, created_at, gross_amount_usd, platform_fee_usd, status, method,
          student:profiles!payments_student_id_fkey (first_name, last_name),
          booking:bookings!payments_booking_id_fkey (
            is_trial,
            course:courses!bookings_course_id_fkey (title),
            teacher:profiles!bookings_teacher_id_fkey (first_name, last_name)
          )
        `)
        .in('student_id', childIds)
        .order('created_at', { ascending: false })
        .limit(100)

      const list: PaymentRecord[] = (raw ?? []).map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        gross_amount_usd: r.gross_amount_usd ?? 0,
        platform_fee_usd: r.platform_fee_usd ?? 0,
        status: r.status,
        method: r.method,
        student_name: `${r.student?.first_name ?? ''} ${r.student?.last_name ?? ''}`.trim(),
        course_title: r.booking?.course?.title ?? null,
        teacher_name: `${r.booking?.teacher?.first_name ?? ''} ${r.booking?.teacher?.last_name ?? ''}`.trim(),
        is_trial: r.booking?.is_trial ?? false,
      }))

      setPayments(list)
      setFiltered(list)

      const succeeded = list.filter(p => p.status === 'succeeded')
      setTotalSpent(succeeded.reduce((sum, p) => sum + p.gross_amount_usd, 0))

      const monthStart = new Date()
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
      const monthPayments = succeeded.filter(p => new Date(p.created_at) >= monthStart)
      setThisMonth(monthPayments.reduce((sum, p) => sum + p.gross_amount_usd, 0))

      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (filter === 'all') setFiltered(payments)
    else setFiltered(payments.filter(p => p.status === filter))
  }, [filter, payments])

  // ── Render ──────────────────────────────────────────────────────────────────

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',       label: 'All Payments' },
    { key: 'succeeded', label: 'Paid' },
    { key: 'pending',   label: 'Pending' },
    { key: 'refunded',  label: 'Refunded' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#0D3D20]">Billing & Payments</h1>
          <p className="text-sm text-[#888] mt-1">Payment history for all your children's lessons.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            <>
              {[
                { label: 'Total Spent (All Time)', value: `$${totalSpent.toFixed(2)}`, icon: '💳', sub: 'All succeeded payments' },
                { label: 'This Month',             value: `$${thisMonth.toFixed(2)}`,  icon: '📅', sub: 'Current billing period' },
                { label: 'Total Transactions',     value: payments.length,             icon: '📋', sub: 'All payment records' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-[#EDE6D6] shadow-sm">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-['Playfair_Display'] text-2xl font-bold text-[#1B5E37]">{s.value}</div>
                  <div className="text-xs text-[#888] mt-1">{s.label}</div>
                  <div className="text-[10px] text-[#bbb] mt-0.5">{s.sub}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-5">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                filter === f.key
                  ? 'bg-[#1B5E37] text-white border-[#1B5E37]'
                  : 'bg-white text-[#555] border-[#EDE6D6] hover:border-[#1B5E37] hover:text-[#1B5E37]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payments table */}
        <div className="bg-white rounded-2xl border border-[#EDE6D6] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[#999]">
              <div className="text-4xl mb-3">💳</div>
              <p className="font-medium text-[#555]">No payments found</p>
              <p className="text-sm mt-1">
                {filter === 'all'
                  ? 'Payment history will appear here once your children have booked lessons.'
                  : `No ${filter} payments found.`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_100px_80px_80px] gap-4 px-6 py-3 bg-[#F5F0E8] text-xs font-semibold text-[#888] uppercase tracking-wide border-b border-[#EDE6D6]">
                <span>Date</span>
                <span>Child · Course</span>
                <span>Teacher</span>
                <span>Method</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Status</span>
              </div>

              <div className="divide-y divide-[#F5F0E8]">
                {filtered.map(p => (
                  <div key={p.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_100px_80px_80px] gap-2 sm:gap-4 px-6 py-4 hover:bg-[#FAFAF7] transition-colors items-center">
                    {/* Date */}
                    <div>
                      <p className="text-sm text-[#333] font-medium">{formatDate(p.created_at)}</p>
                      {p.is_trial && (
                        <span className="text-[10px] bg-[#F0E4B8] text-[#B8952A] font-semibold px-2 py-0.5 rounded-full">Trial</span>
                      )}
                    </div>
                    {/* Child + Course */}
                    <div>
                      <p className="text-sm font-semibold text-[#0D3D20]">{p.student_name || '—'}</p>
                      <p className="text-xs text-[#888]">{p.course_title ?? 'Quran Lesson'}</p>
                    </div>
                    {/* Teacher */}
                    <p className="text-sm text-[#555]">{p.teacher_name || '—'}</p>
                    {/* Method */}
                    <p className="text-sm text-[#555]">{methodIcon(p.method)} {p.method}</p>
                    {/* Amount */}
                    <p className="text-sm font-bold text-[#1B5E37] sm:text-right">${p.gross_amount_usd.toFixed(2)}</p>
                    {/* Status */}
                    <div className="sm:text-right">
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <div className="px-6 py-3 bg-[#F5F0E8] border-t border-[#EDE6D6] text-xs text-[#aaa]">
                Showing {filtered.length} payment{filtered.length !== 1 ? 's' : ''}
                {filter !== 'all' ? ` · Filtered: ${filter}` : ''}
                {' · '}Platform fees are deducted from teacher payouts, not from your payment.
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
