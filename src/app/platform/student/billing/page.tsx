'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  invoice_number: string
  status: string
  total_usd: number
  platform_fee_usd: number
  description: string | null
  paid_at: string | null
  created_at: string
  teacher_name?: string
  course_title?: string
}

interface PaymentRecord {
  id: string
  gross_amount_usd: number
  platform_fee_usd: number
  status: string
  provider: string
  payment_type: string
  description: string | null
  created_at: string
  teacher_name?: string
}

interface Summary {
  totalSpent: number
  thisMonth: number
  totalLessons: number
  pendingPayments: number
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

function KpiCard({ label, value, icon, gradient, loading }: {
  label: string; value: string; icon: string; gradient: string; loading: boolean
}) {
  if (loading) return <Skeleton className="h-28" />
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-default"
      style={{ background: gradient, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
    >
      <div className="text-2xl mb-3">{icon}</div>
      <div>
        <div className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>{value}</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#5A7A6A' }}>{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    paid:      { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37' },
    succeeded: { bg: 'rgba(27,94,55,0.1)',    color: '#1B5E37' },
    pending:   { bg: 'rgba(184,149,42,0.12)', color: '#B8952A' },
    failed:    { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
    refunded:  { bg: 'rgba(99,102,241,0.1)',  color: '#6366F1' },
  }
  const s = map[status] ?? { bg: 'rgba(0,0,0,0.06)', color: '#666' }
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase"
      style={{ background: s.bg, color: s.color }}>
      {status === 'succeeded' ? 'paid' : status}
    </span>
  )
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, { label: string; color: string }> = {
    mock:     { label: 'Test',    color: '#6366F1' },
    stripe:   { label: 'Stripe', color: '#635BFF' },
    jazzcash: { label: 'JazzCash', color: '#00A651' },
  }
  const p = map[provider] ?? { label: provider, color: '#999' }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{ background: `${p.color}15`, color: p.color }}>
      {p.label}
    </span>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function StudentBillingPage() {
  const supabase = createClient()

  const [invoices, setInvoices]     = useState<Invoice[]>([])
  const [payments, setPayments]     = useState<PaymentRecord[]>([])
  const [summary, setSummary]       = useState<Summary>({ totalSpent: 0, thisMonth: 0, totalLessons: 0, pendingPayments: 0 })
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'invoices' | 'payments'>('invoices')
  const [filter, setFilter]         = useState<'all' | 'paid' | 'pending'>('all')

  useEffect(() => { loadBilling() }, [])

  async function loadBilling() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load invoices
    const { data: rawInvoices } = await (supabase as any)
      .from('invoices')
      .select(`
        id, invoice_number, status, total_usd, platform_fee_usd,
        description, paid_at, created_at,
        teacher:profiles!invoices_teacher_id_fkey(first_name, last_name)
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    const invList: Invoice[] = (rawInvoices ?? []).map((i: any) => ({
      ...i,
      teacher_name: i.teacher ? `${i.teacher.first_name} ${i.teacher.last_name}` : 'Teacher',
    }))
    setInvoices(invList)

    // Load payments
    const { data: rawPayments } = await (supabase as any)
      .from('payments')
      .select(`
        id, gross_amount_usd, platform_fee_usd, status,
        provider, payment_type, description, created_at,
        teacher:profiles!payments_teacher_id_fkey(first_name, last_name)
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    const pmtList: PaymentRecord[] = (rawPayments ?? []).map((p: any) => ({
      ...p,
      teacher_name: p.teacher ? `${p.teacher.first_name} ${p.teacher.last_name}` : 'Teacher',
    }))
    setPayments(pmtList)

    // Summary
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const paid = pmtList.filter(p => p.status === 'succeeded')
    setSummary({
      totalSpent:      paid.reduce((s, p) => s + p.gross_amount_usd, 0),
      thisMonth:       paid.filter(p => new Date(p.created_at) >= monthStart).reduce((s, p) => s + p.gross_amount_usd, 0),
      totalLessons:    paid.length,
      pendingPayments: pmtList.filter(p => p.status === 'pending').length,
    })

    setLoading(false)
  }

  const filteredInvoices = invoices.filter(i => {
    if (filter === 'paid')    return i.status === 'paid'
    if (filter === 'pending') return i.status !== 'paid'
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8952A' }}>
            Billing
          </p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Billing & Payments
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7A6B' }}>
            View your payment history, invoices, and spending summary.
          </p>
        </div>
        <Link
          href="/platform/teachers"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={{ background: '#1B5E37', boxShadow: '0 4px 12px rgba(27,94,55,0.25)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}
        >
          Book a Lesson
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Spent"      value={loading ? '—' : fmt(summary.totalSpent)}       icon="💳" gradient="linear-gradient(135deg, #E8F5EE, #D4EDDA)" loading={loading} />
        <KpiCard label="This Month"       value={loading ? '—' : fmt(summary.thisMonth)}         icon="📅" gradient="linear-gradient(135deg, #FFF8E8, #FDEFC9)" loading={loading} />
        <KpiCard label="Lessons Paid"     value={loading ? '—' : String(summary.totalLessons)}   icon="📖" gradient="linear-gradient(135deg, #EEF2FF, #E0E7FF)" loading={loading} />
        <KpiCard label="Pending"          value={loading ? '—' : String(summary.pendingPayments)} icon="⏳" gradient="linear-gradient(135deg, #F5F0FF, #EDE9FE)" loading={loading} />
      </div>

      {/* Test mode banner */}
      <div
        className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        <span className="text-xl flex-shrink-0">🧪</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#4338CA' }}>Test Mode Active</p>
          <p className="text-xs mt-0.5" style={{ color: '#6366F1' }}>
            Payments shown here are test transactions. No real money has been charged. Stripe will be enabled before launch.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl p-1 mb-6 w-fit" style={{ background: '#F5F0E8' }}>
        {(['invoices', 'payments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
            style={activeTab === t ? { background: '#1B5E37', color: '#fff' } : { color: '#7A8A7A' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Invoices Tab ── */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Invoices
            </h2>
            <div className="flex gap-1 rounded-xl p-1" style={{ background: '#F5F0E8' }}>
              {(['all', 'paid', 'pending'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={filter === f ? { background: '#1B5E37', color: '#fff' } : { color: '#7A8A7A' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🧾</div>
              <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No invoices yet</p>
              <p className="text-xs mt-1.5 mb-5" style={{ color: '#9A9A8A' }}>
                Invoices are generated automatically after each payment.
              </p>
              <Link href="/platform/teachers"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#1B5E37' }}>
                Book Your First Lesson
              </Link>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-5 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#9A9A8A', background: 'rgba(0,0,0,0.01)' }}>
                <span className="col-span-2">Invoice</span>
                <span>Teacher</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              <div className="divide-y" style={{ borderColor: 'rgba(27,94,55,0.05)' }}>
                {filteredInvoices.map(inv => (
                  <div
                    key={inv.id}
                    className="grid grid-cols-5 items-center px-6 py-4 transition-all"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.02)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div className="col-span-2">
                      <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>{inv.invoice_number}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                        {inv.description || 'Quran Lesson'} · {fmtDate(inv.paid_at || inv.created_at)}
                      </p>
                    </div>
                    <div className="text-sm" style={{ color: '#5A7A6A' }}>{inv.teacher_name}</div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#0D3D20' }}>{fmt(inv.total_usd)}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>incl. {fmt(inv.platform_fee_usd)} fee</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Payments Tab ── */}
      {activeTab === 'payments' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

          <div className="px-6 py-4 border-b"
            style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
            <h2 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
              Payment History
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">💳</div>
              <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>No payments yet</p>
              <p className="text-xs mt-1.5" style={{ color: '#9A9A8A' }}>Your payment history will appear here.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 px-6 py-2.5 text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#9A9A8A', background: 'rgba(0,0,0,0.01)' }}>
                <span className="col-span-2">Description</span>
                <span>Teacher</span>
                <span>Amount</span>
                <span>Status</span>
              </div>

              <div className="divide-y" style={{ borderColor: 'rgba(27,94,55,0.05)' }}>
                {payments.map(p => (
                  <div
                    key={p.id}
                    className="grid grid-cols-5 items-center px-6 py-4 transition-all"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,94,55,0.02)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: '#0D3D20' }}>
                          {p.description || 'Quran Lesson'}
                        </p>
                        <ProviderBadge provider={p.provider} />
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
                        {p.payment_type?.replace('_', ' ')} · {fmtDate(p.created_at)}
                      </p>
                    </div>
                    <div className="text-sm" style={{ color: '#5A7A6A' }}>{p.teacher_name}</div>
                    <div className="text-sm font-bold" style={{ color: '#0D3D20' }}>{fmt(p.gross_amount_usd)}</div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Spending breakdown */}
      {!loading && payments.filter(p => p.status === 'succeeded').length > 0 && (
        <div className="mt-6 rounded-2xl p-5"
          style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p className="font-bold text-sm mb-4" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Spending by Course Type
          </p>
          {(() => {
            const byType: Record<string, number> = {}
            payments.filter(p => p.status === 'succeeded').forEach(p => {
              const type = p.payment_type?.replace('_', ' ') || 'lesson'
              byType[type] = (byType[type] || 0) + p.gross_amount_usd
            })
            const total = Object.values(byType).reduce((s, v) => s + v, 0)
            const colors = ['#1B5E37', '#B8952A', '#6366F1', '#EC4899', '#F59E0B']
            return Object.entries(byType).map(([type, amount], i) => (
              <div key={type} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize font-medium" style={{ color: '#0D3D20' }}>{type}</span>
                  <span style={{ color: '#5A7A6A' }}>{fmt(amount)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: '#F0EDE6' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(amount / total) * 100}%`, background: colors[i % colors.length] }} />
                </div>
              </div>
            ))
          })()}
        </div>
      )}

      {/* Payment method placeholder */}
      <div className="mt-6 rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Saved Payment Methods
          </h3>
          <span className="text-xs px-2 py-1 rounded-lg font-semibold"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
            Coming Soon
          </span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: '#F5F0E8', border: '1px dashed rgba(27,94,55,0.2)' }}>
          <span className="text-2xl">💳</span>
          <div>
            <p className="text-sm font-medium" style={{ color: '#0D3D20' }}>No saved payment methods</p>
            <p className="text-xs mt-0.5" style={{ color: '#9A9A8A' }}>
              Stripe card management will be available before launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
