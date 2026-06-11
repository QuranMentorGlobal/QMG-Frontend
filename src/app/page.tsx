// src/app/page.tsx
// Root of the app — redirect based on auth status

import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export default async function RootPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  if (profile.role === 'teacher') {
    redirect('/platform/teacher/dashboard')
  }

  redirect('/platform/student/dashboard')
}
