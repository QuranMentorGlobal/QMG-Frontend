// src/lib/auth.ts
// Auth helpers used in Server Components and Server Actions

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types/database'

// Get the current user's profile — redirects to login if not authenticated
export async function requireAuth(): Promise<Profile> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/auth/login')
  }

  return profile
}

// Get user profile without redirecting (returns null if not logged in)
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

// Require a specific role (e.g. teacher-only pages)
export async function requireRole(role: 'student' | 'teacher' | 'admin'): Promise<Profile> {
  const profile = await requireAuth()

  if (profile.role !== role && profile.role !== 'admin') {
    // Redirect to their correct dashboard
    if (profile.role === 'teacher') redirect('/platform/teacher/dashboard')
    if (profile.role === 'student') redirect('/platform/student/dashboard')
    redirect('/')
  }

  return profile
}
