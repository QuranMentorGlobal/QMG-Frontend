import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DAILY_API_URL = 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY

// ── POST /api/video/room ───────────────────────────────────────────────────────
// Called when teacher confirms a booking
// Creates a Daily.co room and stores the URL in all related lessons

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { booking_id } = await req.json()
    if (!booking_id) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

    // ── Verify teacher owns this booking ──────────────────────────────────────
    const { data: booking } = await (supabase as any)
      .from('bookings')
      .select('id, teacher_id, student_id, start_date, session_time, course_id, courses(title, duration_mins)')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.teacher_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const durationMins = booking.courses?.duration_mins || 60
    const roomName = `qmg-${booking_id.slice(0, 8)}-${Date.now()}`

    // ── MOCK MODE (no Daily.co key) ───────────────────────────────────────────
    if (!DAILY_API_KEY) {
      const mockRoomUrl = `https://quranmentorglobal.daily.co/${roomName}`

      // Store mock URL in all lessons for this booking
      await (supabase as any)
        .from('lessons')
        .update({ daily_room_url: mockRoomUrl })
        .eq('booking_id', booking_id)

      // If no lessons exist yet, create the first one
      const { data: existingLessons } = await (supabase as any)
        .from('lessons')
        .select('id')
        .eq('booking_id', booking_id)

      if (!existingLessons || existingLessons.length === 0) {
        // Build scheduled_at from start_date + session_time
        const scheduledAt = `${booking.start_date}T${booking.session_time || '10:00'}:00`

        await (supabase as any).from('lessons').insert({
          booking_id:    booking_id,
          student_id:    booking.student_id,
          teacher_id:    user.id,
          status:        'scheduled',
          scheduled_at:  scheduledAt,
          duration_mins: durationMins,
          daily_room_url: mockRoomUrl,
        })
      }

      return NextResponse.json({
        mode: 'mock',
        room_url: mockRoomUrl,
        room_name: roomName,
      })
    }

    // ── REAL DAILY.CO MODE ────────────────────────────────────────────────────

    // Room expires 1 hour after the lesson duration ends
    const expiryBuffer = durationMins * 60 + 3600 // lesson + 1 hour buffer
    const expiryTimestamp = Math.floor(Date.now() / 1000) + expiryBuffer

    const dailyRes = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expiryTimestamp,
          max_participants: 2,
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: true,  // student waits for teacher to admit
          start_video_off: false,
          start_audio_off: false,
          lang: 'en',
          // Branding
          meeting_join_hook: '',
        },
      }),
    })

    if (!dailyRes.ok) {
      const err = await dailyRes.json()
      console.error('Daily.co error:', err)
      return NextResponse.json({ error: 'Failed to create video room: ' + JSON.stringify(err) }, { status: 500 })
    }

    const room = await dailyRes.json()
    const roomUrl = room.url

    // ── Store URL in lessons ──────────────────────────────────────────────────

    const { data: existingLessons } = await (supabase as any)
      .from('lessons')
      .select('id')
      .eq('booking_id', booking_id)

    if (existingLessons && existingLessons.length > 0) {
      // Update existing lessons
      await (supabase as any)
        .from('lessons')
        .update({ daily_room_url: roomUrl })
        .eq('booking_id', booking_id)
    } else {
      // Create first lesson
      const scheduledAt = `${booking.start_date}T${booking.session_time || '10:00'}:00`
      await (supabase as any).from('lessons').insert({
        booking_id:    booking_id,
        student_id:    booking.student_id,
        teacher_id:    user.id,
        status:        'scheduled',
        scheduled_at:  scheduledAt,
        duration_mins: durationMins,
        daily_room_url: roomUrl,
      })
    }

    // ── Generate teacher token (owner privileges) ─────────────────────────────
    const tokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true,
          user_name: 'Teacher',
          exp: expiryTimestamp,
          enable_screenshare: true,
        },
      }),
    })

    let teacherToken = null
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json()
      teacherToken = tokenData.token
    }

    return NextResponse.json({
      mode: 'daily',
      room_url: roomUrl,
      room_name: roomName,
      teacher_token: teacherToken,
      expires_at: new Date(expiryTimestamp * 1000).toISOString(),
    })

  } catch (err: any) {
    console.error('Video room error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// ── GET /api/video/room?booking_id=xxx ────────────────────────────────────────
// Get room URL for an existing booking (student use)

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const bookingId = req.nextUrl.searchParams.get('booking_id')
    if (!bookingId) return NextResponse.json({ error: 'booking_id required' }, { status: 400 })

    const { data: lesson } = await (supabase as any)
      .from('lessons')
      .select('id, daily_room_url, scheduled_at, status')
      .eq('booking_id', bookingId)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single()

    if (!lesson) return NextResponse.json({ error: 'No lesson found' }, { status: 404 })

    // Check join window: 15 mins before to 1 hour after scheduled time
    const scheduled = new Date(lesson.scheduled_at).getTime()
    const now = Date.now()
    const canJoin = now >= scheduled - 15 * 60 * 1000

    return NextResponse.json({
      room_url: lesson.daily_room_url,
      scheduled_at: lesson.scheduled_at,
      status: lesson.status,
      can_join: canJoin,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
