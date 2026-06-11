// src/app/platform/teacher/dashboard/page.tsx
import { requireRole } from '@/lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Teacher Dashboard' }

export default async function TeacherDashboard() {
  const profile = await requireRole('teacher')

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-green-dark mb-1">
        Assalamu Alaikum, {profile.first_name} 🌙
      </h1>
      <p className="text-ink-light mb-8">Manage your students, lessons, and earnings.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Students',    value: '0',  icon: '👨‍🎓' },
          { label: "Today's Lessons",   value: '0',  icon: '📅' },
          { label: 'Pending Bookings',  value: '0',  icon: '⏳' },
          { label: 'Earnings (Month)',  value: '$0', icon: '💰' },
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
          📌 Full teacher dashboard with schedule, student list, and earnings coming in next steps.
        </p>
      </div>
    </div>
  )
}
