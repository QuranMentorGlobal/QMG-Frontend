// src/app/platform/student/dashboard/page.tsx
import { requireRole } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Dashboard' }

export default async function StudentDashboard() {
  const profile = await requireRole('student')

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-green-dark mb-1">
        Assalamu Alaikum, {profile.first_name} 🌙
      </h1>
      <p className="text-ink-light mb-8">Welcome back to your Quran learning journey.</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Lessons Completed', value: '0',       icon: '✅' },
          { label: 'Upcoming Lessons',  value: '0',       icon: '📅' },
          { label: 'Active Bookings',   value: '0',       icon: '📖' },
          { label: 'Learning Streak',   value: '0 days',  icon: '🔥' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-2xl">{s.icon}</div>
            <div className="font-display text-2xl font-bold text-green-dark">{s.value}</div>
            <div className="text-xs text-ink-light">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-ink-light text-sm">
          📌 Full dashboard with bookings, upcoming lessons, and teacher cards coming in the next step.
        </p>
      </div>
    </div>
  )
}
