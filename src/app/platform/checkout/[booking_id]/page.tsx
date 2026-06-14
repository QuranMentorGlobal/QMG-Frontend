'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// ── Test cards ─────────────────────────────────────────────────────────────────

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'Visa',       color: '#1A1F71', result: 'success' },
  { number: '5555 5555 5555 4444', brand: 'Mastercard', color: '#EB001B', result: 'success' },
  { number: '4000 0000 0000 0002', brand: 'Visa',       color: '#1A1F71', result: 'decline' },
]

// ── Card brand icon ────────────────────────────────────────────────────────────

function CardIcon({ brand }: { brand: string }) {
  if (brand === 'mastercard') return (
    <svg width="38" height="24" viewBox="0 0 38 24">
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="23" cy="12" r="10" fill="#F79E1B" />
      <path d="M19 5.8a10 10 0 0 1 0 12.4A10 10 0 0 1 19 5.8z" fill="#FF5F00" />
    </svg>
  )
  if (brand === 'amex') return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
      <rect width="38" height="24" rx="4" fill="#2557D6"/>
      <text x="7" y="17" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  )
  // Default Visa
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none">
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <text x="6" y="17" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial" fontStyle="italic">VISA</text>
    </svg>
  )
}

// ── Detect card brand from number ─────────────────────────────────────────────

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, '')
  if (n.startsWith('4')) return 'visa'
  if (n.startsWith('5') || n.startsWith('2')) return 'mastercard'
  if (n.startsWith('3')) return 'amex'
  return 'visa'
}

// ── Format card number input ──────────────────────────────────────────────────

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

// ── Booking details type ───────────────────────────────────────────────────────

interface BookingDetails {
  course_title: string
  teacher_name: string
  start_date: string
  session_time: string
  is_trial: boolean
  price_usd: number
}

// ── Main checkout page ─────────────────────────────────────────────────────────

export default function MockCheckoutPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const supabase     = createClient()

  const bookingId = params.booking_id as string
  const amount    = parseFloat(searchParams.get('amount') || '0')
  const desc      = decodeURIComponent(searchParams.get('desc') || 'Quran Lesson')

  // Form state
  const [cardNumber, setCardNumber]   = useState('')
  const [expiry, setExpiry]           = useState('')
  const [cvc, setCvc]                 = useState('')
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [zip, setZip]                 = useState('')
  const [saveCard, setSaveCard]       = useState(false)

  // UI state
  const [paying, setPaying]           = useState(false)
  const [step, setStep]               = useState<'form' | 'processing' | 'success' | 'declined'>('form')
  const [error, setError]             = useState('')
  const [booking, setBooking]         = useState<BookingDetails | null>(null)
  const [loadingBooking, setLoadingBooking] = useState(true)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [selectedTestCard, setSelectedTestCard] = useState<string | null>(null)

  const brand = detectBrand(cardNumber)

  useEffect(() => {
    loadBooking()
    prefillEmail()
  }, [])

  async function loadBooking() {
    const { data } = await (supabase as any)
      .from('bookings')
      .select(`
        price_usd, is_trial, start_date, session_time,
        courses(title),
        profiles!bookings_teacher_id_fkey(first_name, last_name)
      `)
      .eq('id', bookingId)
      .single()

    if (data) {
      setBooking({
        course_title: data.courses?.title || 'Quran Lesson',
        teacher_name: `${data.profiles?.first_name || ''} ${data.profiles?.last_name || ''}`.trim(),
        start_date: data.start_date,
        session_time: data.session_time,
        is_trial: data.is_trial,
        price_usd: data.price_usd,
      })
    }
    setLoadingBooking(false)
  }

  async function prefillEmail() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return
    setEmail(user.email)
    const { data: prof } = await (supabase as any).from('profiles').select('first_name, last_name').eq('id', user.id).single()
    if (prof) setName(`${prof.first_name || ''} ${prof.last_name || ''}`.trim())
  }

  function applyTestCard(card: typeof TEST_CARDS[0]) {
    setSelectedTestCard(card.number)
    setCardNumber(card.number)
    setExpiry('12/28')
    setCvc('123')
    setError('')
  }

  function validate() {
    const rawCard = cardNumber.replace(/\s/g, '')
    if (rawCard.length < 16) return 'Please enter a valid 16-digit card number.'
    if (!expiry.match(/^\d{2}\/\d{2}$/)) return 'Please enter a valid expiry date (MM/YY).'
    if (cvc.length < 3) return 'Please enter a valid CVC.'
    if (!name.trim()) return 'Please enter the cardholder name.'
    if (!email.includes('@')) return 'Please enter a valid email address.'
    return ''
  }

  async function handlePay() {
    const err = validate()
    if (err) { setError(err); return }

    setPaying(true)
    setError('')
    setStep('processing')

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 2200))

    // Check if this is a decline test card
    const rawCard = cardNumber.replace(/\s/g, '')
    if (rawCard === '4000000000000002') {
      setStep('declined')
      setPaying(false)
      return
    }

    // Mark payment as succeeded in DB (already succeeded from checkout route, but update metadata)
    await (supabase as any)
      .from('payments')
      .update({
        metadata: {
          card_last4: rawCard.slice(-4),
          card_brand: brand,
          cardholder_name: name,
          mock_checkout: true,
        },
      })
      .eq('booking_id', bookingId)
      .eq('provider', 'mock')

    setStep('success')
    setPaying(false)
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#0D0D0D',
    background: '#fff',
    outline: 'none',
    transition: 'all 0.15s',
  }

  function inputStyle(field: string): React.CSSProperties {
    return {
      ...inputBase,
      border: `1.5px solid ${focusedField === field ? '#635BFF' : '#E0E0E0'}`,
      boxShadow: focusedField === field ? '0 0 0 3px rgba(99,91,255,0.12)' : 'none',
    }
  }

  // ── Processing screen ──────────────────────────────────────────────────────

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-6"
            style={{ borderColor: '#635BFF', borderTopColor: 'transparent' }} />
          <p className="font-semibold text-lg" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Processing payment…
          </p>
          <p className="text-sm mt-2" style={{ color: '#8A9A8A' }}>Please wait, do not close this page.</p>
        </div>
      </div>
    )
  }

  // ── Declined screen ────────────────────────────────────────────────────────

  if (step === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F5F0E8' }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: 'rgba(239,68,68,0.1)' }}>❌</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
            Card Declined
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6B7A6B' }}>
            Your card was declined. Please try a different card or contact your bank.
          </p>
          <button onClick={() => setStep('form')}
            className="w-full py-3 rounded-xl font-semibold text-white"
            style={{ background: '#635BFF' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F5F0E8' }}>
        <div className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            {/* Success header */}
            <div className="px-8 py-8 text-center" style={{ background: 'linear-gradient(135deg, #0D3D20, #1B5E37)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: 'rgba(255,255,255,0.15)' }}>✅</div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Payment Successful!
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Your booking is confirmed
              </p>
            </div>

            {/* Details */}
            <div className="px-8 py-6 space-y-3">
              <div className="flex justify-between text-sm py-2 border-b" style={{ borderColor: '#F0EDE6' }}>
                <span style={{ color: '#8A9A8A' }}>Amount paid</span>
                <span className="font-bold" style={{ color: '#0D3D20' }}>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b" style={{ borderColor: '#F0EDE6' }}>
                <span style={{ color: '#8A9A8A' }}>Course</span>
                <span className="font-semibold" style={{ color: '#0D3D20' }}>{booking?.course_title || desc}</span>
              </div>
              {booking?.teacher_name && (
                <div className="flex justify-between text-sm py-2 border-b" style={{ borderColor: '#F0EDE6' }}>
                  <span style={{ color: '#8A9A8A' }}>Teacher</span>
                  <span className="font-semibold" style={{ color: '#0D3D20' }}>{booking.teacher_name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm py-2 border-b" style={{ borderColor: '#F0EDE6' }}>
                <span style={{ color: '#8A9A8A' }}>Card charged</span>
                <span className="font-semibold" style={{ color: '#0D3D20' }}>
                  {brand.charAt(0).toUpperCase() + brand.slice(1)} •••• {cardNumber.replace(/\s/g, '').slice(-4)}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2" >
                <span style={{ color: '#8A9A8A' }}>Receipt sent to</span>
                <span className="font-semibold" style={{ color: '#0D3D20' }}>{email}</span>
              </div>
            </div>

            {/* Hadith */}
            <div className="mx-6 mb-4 rounded-xl p-4 text-center" style={{ background: 'rgba(27,94,55,0.06)' }}>
              <p style={{ fontFamily: "'Amiri', serif", color: '#1B5E37', fontSize: 15, direction: 'rtl' }}>
                خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
              </p>
              <p className="text-xs mt-1" style={{ color: '#8A9A8A' }}>
                "The best of you are those who learn the Quran and teach it."
              </p>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Link href="/platform/student/bookings"
                className="block w-full py-3 rounded-xl text-center font-semibold text-white transition-all"
                style={{ background: '#1B5E37' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0D3D20' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1B5E37' }}>
                View My Bookings →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Checkout form ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: '#F5F0E8' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/platform/teachers`}
            className="flex items-center gap-2 text-sm font-medium transition-all"
            style={{ color: '#6B7A6B' }}>
            ← Cancel
          </Link>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="QMG" className="h-8 w-auto" />
            <span className="font-bold" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
              Quran<span style={{ color: '#B8952A' }}>Mentor</span>Global
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#8A9A8A' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Payment form ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Test mode notice */}
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: 'rgba(99,91,255,0.08)', border: '1px solid rgba(99,91,255,0.2)' }}>
              <span className="text-lg flex-shrink-0">🧪</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#4C46A8' }}>Test Mode — No real payment</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B65B8' }}>
                  Use a test card below. No money will be charged.
                </p>
              </div>
            </div>

            {/* Test cards */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#8A9A8A' }}>
                Quick fill — test cards
              </p>
              <div className="space-y-2">
                {TEST_CARDS.map(card => (
                  <button key={card.number} onClick={() => applyTestCard(card)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all"
                    style={{
                      background: selectedTestCard === card.number ? 'rgba(99,91,255,0.08)' : '#F9F7F4',
                      border: selectedTestCard === card.number ? '1.5px solid #635BFF' : '1.5px solid transparent',
                    }}>
                    <div className="flex items-center gap-3">
                      <CardIcon brand={card.brand.toLowerCase()} />
                      <div>
                        <p className="text-sm font-semibold font-mono" style={{ color: '#0D0D0D' }}>{card.number}</p>
                        <p className="text-xs" style={{ color: '#8A9A8A' }}>{card.brand} · Exp 12/28 · CVC 123</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0"
                      style={card.result === 'success'
                        ? { background: 'rgba(27,94,55,0.1)', color: '#1B5E37' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>
                      {card.result === 'success' ? '✓ Succeeds' : '✗ Declines'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card form */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
                Card Information
              </p>

              {/* Card number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
                  Card Number
                </label>
                <div className="relative">
                  <input
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    onFocus={() => setFocusedField('card')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="1234 5678 9012 3456"
                    style={{ ...inputStyle('card'), paddingRight: 56 }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CardIcon brand={brand} />
                  </div>
                </div>
              </div>

              {/* Expiry + CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
                    Expiry Date
                  </label>
                  <input
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    onFocus={() => setFocusedField('expiry')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="MM / YY"
                    style={inputStyle('expiry')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
                    CVC
                  </label>
                  <input
                    value={cvc}
                    onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onFocus={() => setFocusedField('cvc')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="123"
                    style={inputStyle('cvc')}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>
                  Cardholder Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Ahmed Khan"
                  style={inputStyle('name')}
                />
              </div>
            </div>

            {/* Billing details */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
                Billing Details
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com" type="email" style={inputStyle('email')} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#5A6A5A' }}>Postcode / ZIP</label>
                <input value={zip} onChange={e => setZip(e.target.value)}
                  onFocus={() => setFocusedField('zip')} onBlur={() => setFocusedField(null)}
                  placeholder="EC1A 1BB" style={inputStyle('zip')} />
              </div>

              {/* Save card */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setSaveCard(s => !s)}
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: saveCard ? '#635BFF' : '#fff', border: `2px solid ${saveCard ? '#635BFF' : '#C0C0C0'}` }}>
                  {saveCard && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                </div>
                <span className="text-sm" style={{ color: '#5A6A5A' }}>Save card for future bookings</span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #635BFF, #7C75FF)', boxShadow: '0 4px 20px rgba(99,91,255,0.35)' }}
              onMouseEnter={e => { if (!paying) (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(99,91,255,0.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(99,91,255,0.35)' }}
            >
              {paying ? 'Processing…' : `Pay $${amount.toFixed(2)}`}
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#B8B8A8' }}>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                SSL Secured
              </span>
              <span>·</span>
              <span>256-bit encryption</span>
              <span>·</span>
              <span>PCI compliant</span>
            </div>
          </div>

          {/* ── Right: Order summary ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden sticky top-6"
              style={{ background: '#fff', border: '1px solid rgba(27,94,55,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

              {/* Summary header */}
              <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(27,94,55,0.07)', background: 'rgba(248,245,240,0.5)' }}>
                <p className="font-bold text-sm" style={{ color: '#0D3D20', fontFamily: "'Playfair Display', serif" }}>
                  Order Summary
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Item */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(27,94,55,0.08)' }}>
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#0D3D20' }}>
                      {loadingBooking ? '…' : (booking?.course_title || desc)}
                    </p>
                    {booking?.teacher_name && (
                      <p className="text-xs mt-0.5" style={{ color: '#8A9A8A' }}>
                        with {booking.teacher_name}
                      </p>
                    )}
                    {booking?.is_trial && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
                        style={{ background: 'rgba(99,91,255,0.1)', color: '#635BFF' }}>
                        FREE TRIAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: '#F0EDE6' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#8A9A8A' }}>Subtotal</span>
                    <span style={{ color: '#0D3D20' }}>${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#8A9A8A' }}>Tax</span>
                    <span style={{ color: '#0D3D20' }}>$0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: '#F0EDE6', color: '#0D3D20' }}>
                    <span>Total</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* What's included */}
                <div className="rounded-xl p-4 space-y-2" style={{ background: '#F5F0E8' }}>
                  <p className="text-xs font-semibold" style={{ color: '#5A7A6A' }}>What&apos;s included:</p>
                  {[
                    'Live 1-on-1 session with certified Qari',
                    'Session recording (coming soon)',
                    'Direct messaging with teacher',
                    'Progress tracking',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5" style={{ color: '#1B5E37' }}>✓</span>
                      <span className="text-xs" style={{ color: '#5A7A6A' }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Money back */}
                <div className="flex items-center gap-2 text-xs" style={{ color: '#8A9A8A' }}>
                  <span>🛡️</span>
                  <span>Money-back guarantee if teacher doesn&apos;t show up</span>
                </div>
              </div>

              {/* Powered by */}
              <div className="px-6 pb-5 flex items-center justify-center gap-2 text-xs" style={{ color: '#C0C0C0' }}>
                <span>Powered by</span>
                <svg width="40" height="16" viewBox="0 0 60 25" fill="none">
                  <text x="0" y="19" fill="#635BFF" fontSize="18" fontWeight="bold" fontFamily="Arial">stripe</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
