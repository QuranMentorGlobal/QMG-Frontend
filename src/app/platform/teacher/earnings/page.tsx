'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Earning {
  id: string
  gross_amount_usd: number
  commission_usd: number
  net_amount_usd: number
  status: string
  available_at: string | null
  description: string | null
  created_at: string
  student_name?: string
}

interface Payout {
  id: string
  amount_usd: number
  status: string
  payout_method: string | null
  initiated_at: string | null
  completed_at: string | null
  created_at: string
}

interface Summary {
  totalEarned: number
  pendingAmount: number
  availableAmount: number
  paidAmount: number
  commissionPaid: number
  thisMonth: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(usd: number) { return `$${usd.toFixed(2)}` }
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#EDE6D6] rounded-2xl ${className}`} />
}

function KpiCard({ label, value, sub, icon, gradient, loading }: {
  label: string; value: string; sub?: string; icon: string; gradient: string; loading: boolean
}) {
  if (loading) return <Skeleton className="h-32" />
  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
      style={{ background: gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
      <div className="text-2xl mb-3">{icon}</div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{label}</div>
        {sub && <div className="text-xs mt-1" style={{ color: '#9A9A8A' }}>{sub}</div>}
      </div>
    </div>
  )
}

function EarningStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    pending:   { bg: 'rgba(184,149,42,0.12)', color: '#B8952A' },
    available: { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37' },
    paid:      { bg: 'rgba(34,197,94,0.1)',   color: '#16A34A' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
      style={{ background: s.bg, color: s.color }}>{status}</span>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function TeacherEarningsPage() {
  const supabase = createClient()
  const [earnings, setEarnings]   = useState<Earning[]>([])
  const [payouts, setPayouts]     = useState<Payout[]>([])
  const [summary, setSummary]     = useState<Summary>({ totalEarned: 0, pendingAmount: 0, availableAmount: 0, paidAmount: 0, commissionPaid: 0, thisMonth: 0 })
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<'earnings' | 'payouts'>('earnings')

  useEffect(() => { loadEarnings() }, [])

  async function loadEarnings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [earningsRes, payoutsRes] = await Promise.all([
      (supabase as any)
        .from('teacher_earnings')
        .select(`
          id, gross_amount_usd, commission_usd, net_amount_usd,
          status, available_at, description, created_at,
          payments!teacher_earnings_payment_id_fkey(
            student:profiles!payments_student_id_fkey(first_name, last_name)
          )
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false }),
      (supabase as any)
        .from('teacher_payouts')
        .select('id, amount_usd, status, payout_method, initiated_at, completed_at, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    const earningList: Earning[] = (earningsRes.data ?? []).map((e: any) => ({
      ...e,
      student_name: e.payments?.student ? `${e.payments.student.first_name} ${e.payments.student.last_name}` : 'Student',
    }))
    setEarnings(earningList)
    setPayouts(payoutsRes.data ?? [])

    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
    setSummary({
      totalEarned:     earningList.reduce((s, e) => s + e.net_amount_usd, 0),
      pendingAmount:   earningList.filter(e => e.status === 'pending').reduce((s, e) => s + e.net_amount_usd, 0),
      availableAmount: earningList.filter(e => e.status === 'available').reduce((s, e) => s + e.net_amount_usd, 0),
      paidAmount:      earningList.filter(e => e.status === 'paid').reduce((s, e) => s + e.net_amount_usd, 0),
      commissionPaid:  earningList.reduce((s, e) => s + e.commission_usd, 0),
      thisMonth:       earningList.filter(e => new Date(e.created_at) >= monthStart).reduce((s, e) => s + e.net_amount_usd, 0),
    })
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>Earnings</p>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
          My Earnings
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
          Track your income, commissions, and upcoming payouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Earned"      value={loading ? '—' : fmt(summary.totalEarned)}     icon="💰" gradient="linear-gradient(135deg, #E8F5EE, #D4EDDA)" loading={loading} />
        <KpiCard label="This Month"        value={loading ? '—' : fmt(summary.thisMonth)}        icon="📅" gradient="linear-gradient(135deg, #FFF8E8, #FDEFC9)" loading={loading} />
        <KpiCard label="Available to Pay"  value={loading ? '—' : fmt(summary.availableAmount)}  icon="✅" gradient="linear-gradient(135deg, #EEF2FF, #E0E7FF)" loading={loading} sub="Ready for payout" />
        <KpiCard label="Pending Clearance" value={loading ? '—' : fmt(summary.pendingAmount)}    icon="⏳" gradient="linear-gradient(135deg, #FFF8E8, #FDEFC9)" loading={loading} sub="Clears in 7 days" />
        <KpiCard label="Total Paid Out"    value={loading ? '—' : fmt(summary.paidAmount)}       icon="🏦" gradient="linear-gradient(135deg, #F5F0FF, #EDE9FE)" loading={loading} />
        <KpiCard label="Platform Fees"     value={loading ? '—' : fmt(summary.commissionPaid)}   icon="📊" gradient="linear-gradient(135deg, #FFF0F0, #FFE4E4)" loading={loading} sub="15% commission" />
      </div>

      {/* Earnings breakdown bar */}
      {!loading && summary.totalEarned > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8A9A8A' }}>Earnings Breakdown</p>
          <div className="flex rounded-xl overflow-hidden h-3 mb-3">
            <div style={{ width: `${(summary.paidAmount / summary.totalEarned) * 100}%`, background: '#1B5E37' }} />
            <div style={{ width: `${(summary.availableAmount / summary.totalEarned) * 100}%`, background: '#B8952A' }} />
            <div style={{ width: `${(summary.pendingAmount / summary.totalEarned) * 100}%`, background: '#E0DDD5' }} />
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#1B5E37' }} /> <span style={{ color: '#5A7A6A' }}>Paid {fmt(summary.paidAmount)}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#B8952A' }} /> <span style={{ color: '#5A7A6A' }}>Available {fmt(summary.availableAmount)}</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E0DDD5' }} /> <span style={{ color: '#5A7A6A' }}>Pending {fmt(summary.pendingAmount)}</span></div>
          </div>
        </div>
      )}

      {/* Payout request banner */}
      {!loading && summary.availableAmount > 0 && (
        <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)' }}>
          <div>
            <p className="text-sm font-bold text-white">
              {fmt(summary.availableAmount)} available for payout
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Payout requests are processed within 3–5 business days.
            </p>
          </div>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all"
            style={{ background: '#D4AF50', color: '#0D3D20' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0E4B8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#D4AF50' }}
            onClick={() => alert('Payout requests will be enabled after Stripe Connect setup. Your earnings are safely recorded.')}
          >
            Request Payout
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl p-1 mb-4 w-fit" style={{ background: '#F5F0E8' }}>
        {(['earnings', 'payouts'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
            style={activeTab === t ? { background: '#1B5E37', color: '#fff' } : { color: '#7A8A7A' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Earnings ledger */}
      {activeTab === 'earnings' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>Earnings Ledger</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : earnings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">💰</div>
              <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No earnings yet</p>
              <p className="text-xs mt-1.5" style={{ color: '#9A9A8A' }}>Earnings appear here after students pay for lessons.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(27,94,55,0.05)' }}>
              {/* Column headers */}
              <div className="grid grid-cols-5 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#9A9A8A', background: 'rgba(0,0,0,0.01)' }}>
                <span className="col-span-2">Description</span>
                <span>Gross</span>
                <span>Your Earnings</span>
                <span>Status</span>
              </div>
              {earnings.map(e => (
                <div key={e.id}
                  className="grid grid-cols-5 items-center px-6 py-4 transition-all"
                  onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.02)' }}
                  onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <div className="col-span-2">
                    <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>
                      {e.description || 'Lesson Payment'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                      {e.student_name} · {fmtDate(e.created_at)}
                    </p>
                  </div>
                  <div className="text-sm" style={{ color: '#5A7A6A' }}>{fmt(e.gross_amount_usd)}</div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#1B5E37' }}>{fmt(e.net_amount_usd)}</div>
                    <div className="text-xs" style={{ color: '#9A9A8A' }}>-{fmt(e.commission_usd)} fee</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <EarningStatusBadge status={e.status} />
                    {e.status === 'pending' && e.available_at && (
                      <span className="text-[10px]" style={{ color: '#B8B8A8' }}>
                        avail. {fmtDate(e.available_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payouts history */}
      {activeTab === 'payouts' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>Payout History</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : payouts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🏦</div>
              <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No payouts yet</p>
              <p className="text-xs mt-1.5" style={{ color: '#9A9A8A' }}>
                Payouts will appear here once you request them. Payout system launches with Stripe Connect.
              </p>
            </div>
          ) : payouts.map(p => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4 border-b transition-all"
              style={{ borderColor: 'rgba(27,94,55,0.05)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.02)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>{fmt(p.amount_usd)} payout</p>
                <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                  {p.payout_method || 'Bank Transfer'} · Requested {fmtDate(p.created_at)}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
                style={p.status === 'paid'
                  ? { background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }
                  : { background: 'rgba(184,149,42,0.12)', color: '#B8952A' }}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Commission info */}
      <div className="mt-6 rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #F5F0E8, #EDE6D6)', border: '1px solid rgba(184,149,42,0.15)' }}>
        <p className="text-sm font-bold mb-1" style={{ color: '#0D3D20' }}>How earnings work</p>
        <p className="text-xs" style={{ color: '#6B7A6B' }}>
          When a student pays for a lesson, 15% goes to QuranMentorGlobal as a platform fee. Your 85% clears after 7 days and becomes available for payout. Payouts are processed via bank transfer, JazzCash, or PayPal.
        </p>
      </div>
    </div>
  )
}
