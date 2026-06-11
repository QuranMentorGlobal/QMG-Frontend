// src/app/auth/signout/route.ts
// POST /auth/signout — signs the user out and redirects to login

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
