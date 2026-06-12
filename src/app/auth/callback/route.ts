import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single() as { data: { role: string } | null }

        const role = data?.role ?? 'student'

        if (role === 'teacher') {
          return NextResponse.redirect(`${origin}/platform/teacher/dashboard`)
        }
        if (role === 'parent') {
          return NextResponse.redirect(`${origin}/platform/parent/dashboard`)
        }
        return NextResponse.redirect(`${origin}/platform/student/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
