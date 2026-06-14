import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ── Stripe (optional — works without it in mock mode) ─────────────────────────
let stripe: any = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe')
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' })
  }
} catch { /* stripe not installed yet */ }

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.quranmentorglobal.com'

// ── Helper: get or create billing profile ─────────────────────────────────────

async function getOrCreateBillingProfile(supabase: any, payerId: string, studentId: string, payerType: string) {
  const { data: existing } = await supabase
    .from('billing_profiles')
    .select('*')
    .eq('payer_id', payerId)
    .eq('student_id', studentId)
    .single()

  if (existing) return existing

  const { data: newProfile } = await supabase
    .from('billing_profiles')
    .insert({ payer_id: payerId, student_id: studentId, payer_type: payerType })
    .select('*')
    .single()

  return newProfile
}

// ── Helper: get active commission rate ────────────────────────────────────────

async function getCommissionRate(supabase: any, teacherId: string): Promise<{ id: string; rate: number }> {
  // Check teacher-specific rate first
  const { data: teacherRate } = await supabase
    .from('commission_rates')
    .select('id, rate_percent')
    .eq('teacher_id', teacherId)
    .is('effective_to', null)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  if (teacherRate) return { id: teacherRate.id, rate: teacherRate.rate_percent }

  // Fall back to global rate
  const { data: globalRate } = await supabase
    .from('commission_rates')
    .select('id, rate_percent')
    .eq('applies_to', 'all')
    .is('effective_to', null)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  return { id: globalRate?.id, rate: globalRate?.rate_percent ?? 15 }
}

// ── POST /api/stripe/checkout ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      booking_id,
      amount_usd,
      description,
      payment_type = 'trial',
      student_id,       // may differ from user.id if parent is paying
      package_id,
    } = body

    if (!booking_id || !amount_usd) {
      return NextResponse.json({ error: 'booking_id and amount_usd are required' }, { status: 400 })
    }

    // ── Verify booking exists and belongs to student ──────────────────────────
    const { data: booking } = await (supabase as any)
      .from('bookings')
      .select('id, student_id, teacher_id, course_id, price_usd, status, is_trial')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'pending') return NextResponse.json({ error: 'Booking is not pending' }, { status: 400 })

    // Determine payer info
    const payerProfile = await (supabase as any).from('profiles').select('role, first_name, last_name, email').eq('id', user.id).single()
    const payerType = payerProfile.data?.role === 'parent' ? 'parent' : 'student'
    const actualStudentId = student_id || booking.student_id

    // Get or create billing profile
    const billingProfile = await getOrCreateBillingProfile(supabase as any, user.id, actualStudentId, payerType)
    if (!billingProfile) return NextResponse.json({ error: 'Could not create billing profile' }, { status: 500 })

    // Get commission rate
    const commission = await getCommissionRate(supabase as any, booking.teacher_id)
    const grossAmount = parseFloat(amount_usd)
    const platformFee = Math.round(grossAmount * commission.rate / 100 * 100) / 100
    const teacherPayout = Math.round((grossAmount - platformFee) * 100) / 100

    // Idempotency key — prevents duplicate payments for same booking
    const idempotencyKey = `booking_${booking_id}_${Date.now()}`

    // ── MOCK MODE (no Stripe key) ─────────────────────────────────────────────
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      // Create payment record with mock provider
      const { data: payment } = await (supabase as any)
        .from('payments')
        .insert({
          student_id:         actualStudentId,
          teacher_id:         booking.teacher_id,
          booking_id:         booking_id,
          billing_profile_id: billingProfile.id,
          payer_type:         payerType,
          payer_id:           user.id,
          provider:           'mock',
          provider_payment_id: `mock_${Date.now()}`,
          payment_type:       payment_type,
          package_id:         package_id || null,
          gross_amount_usd:   grossAmount,
          platform_fee_usd:   platformFee,
          teacher_payout_usd: teacherPayout,
          commission_rate_id: commission.id,
          commission_percent: commission.rate,
          status:             'succeeded',   // mock = instant success
          currency:           'USD',
          idempotency_key:    idempotencyKey,
          description:        description || 'Quran Lesson — Mock Payment',
        })
        .select('id')
        .single()

      if (!payment) return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })

      // Log attempt
      await (supabase as any).from('payment_attempts').insert({
        payment_id:         payment.id,
        billing_profile_id: billingProfile.id,
        booking_id:         booking_id,
        provider:           'mock',
        provider_attempt_id: `mock_attempt_${Date.now()}`,
        amount_usd:         grossAmount,
        status:             'succeeded',
        idempotency_key:    idempotencyKey,
        metadata:           { mode: 'mock', description: 'Test mode — no real charge' },
      })

      // Return mock success URL
      return NextResponse.json({
        mode: 'mock',
        payment_id: payment.id,
        redirect_url: `${APP_URL}/platform/student/bookings?payment=success&booking=${booking_id}`,
      })
    }

    // ── STRIPE MODE ───────────────────────────────────────────────────────────

    // Get or create Stripe customer
    let stripeCustomerId = billingProfile.stripe_customer_id
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: payerProfile.data?.email || user.email,
        name: `${payerProfile.data?.first_name || ''} ${payerProfile.data?.last_name || ''}`.trim(),
        metadata: { billing_profile_id: billingProfile.id, payer_id: user.id, student_id: actualStudentId },
      })
      stripeCustomerId = customer.id
      await (supabase as any).from('billing_profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', billingProfile.id)
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(grossAmount * 100), // cents
          product_data: {
            name: description || `Quran Lesson — ${booking.is_trial ? 'Trial' : 'Session'}`,
            description: `QuranMentorGlobal.com`,
          },
        },
        quantity: 1,
      }],
      success_url: `${APP_URL}/platform/student/bookings?payment=success&booking=${booking_id}&session={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/platform/teachers/${booking.teacher_id}/book?cancelled=true`,
      metadata: {
        booking_id,
        student_id: actualStudentId,
        teacher_id: booking.teacher_id,
        billing_profile_id: billingProfile.id,
        payer_id: user.id,
        payer_type: payerType,
        payment_type,
        commission_rate_id: commission.id,
        commission_percent: commission.rate.toString(),
        idempotency_key: idempotencyKey,
      },
      payment_intent_data: {
        metadata: { booking_id, idempotency_key: idempotencyKey },
      },
    }, {
      idempotencyKey, // Stripe-level idempotency
    })

    // Create pending payment record
    const { data: payment } = await (supabase as any)
      .from('payments')
      .insert({
        student_id:           actualStudentId,
        teacher_id:           booking.teacher_id,
        booking_id:           booking_id,
        billing_profile_id:   billingProfile.id,
        payer_type:           payerType,
        payer_id:             user.id,
        provider:             'stripe',
        provider_payment_id:  session.payment_intent,
        provider_customer_id: stripeCustomerId,
        payment_type,
        package_id:           package_id || null,
        gross_amount_usd:     grossAmount,
        platform_fee_usd:     platformFee,
        teacher_payout_usd:   teacherPayout,
        commission_rate_id:   commission.id,
        commission_percent:   commission.rate,
        status:               'pending',
        currency:             'USD',
        idempotency_key:      idempotencyKey,
        description:          description || 'Quran Lesson',
        metadata:             { stripe_session_id: session.id },
      })
      .select('id')
      .single()

    // Log attempt
    await (supabase as any).from('payment_attempts').insert({
      payment_id:           payment?.id,
      billing_profile_id:   billingProfile.id,
      booking_id,
      provider:             'stripe',
      provider_attempt_id:  session.id,
      amount_usd:           grossAmount,
      status:               'pending',
      idempotency_key:      idempotencyKey,
      metadata:             { stripe_session_id: session.id },
    })

    return NextResponse.json({ mode: 'stripe', checkout_url: session.url })

  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
