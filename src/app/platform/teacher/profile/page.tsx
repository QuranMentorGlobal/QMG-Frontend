'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { CourseType } from '@/types/database'

const COURSE_TYPES: CourseType[] = ['noorani_qaida', 'tajweed', 'hifz', 'tafseer', 'islamic_studies', 'ijazah']
const COURSE_LABELS: Record<CourseType, string> = {
  noorani_qaida: 'Noorani Qaida', tajweed: 'Tajweed', hifz: 'Hifz',
  tafseer: 'Tafseer', islamic_studies: 'Islamic Studies', ijazah: 'Ijazah',
}
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COUNTRIES = ['Pakistan', 'United Kingdom', 'United States', 'UAE', 'Saudi Arabia', 'Canada', 'Australia', 'Other']

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E8E4DA] ${className}`} />
}

export default function TeacherProfile() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')

  // Teacher profile fields
  const [hourlyRate, setHourlyRate] = useState(15)
  const [trialRate, setTrialRate] = useState(5)
  const [yearsExp, setYearsExp] = useState(1)
  const [specializations, setSpecializations] = useState<CourseType[]>([])
  const [languages, setLanguages] = useState('')
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [tpId, setTpId] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        const p = prof as any
        setFirstName(p.first_name ?? '')
        setLastName(p.last_name ?? '')
        setEmail(p.email ?? '')
        setBio(p.bio ?? '')
        setCountry(p.country ?? '')
        setPhone(p.phone ?? '')
      }

      const { data: tp } = await supabase.from('teacher_profiles').select('*').eq('user_id', user.id).single()
      if (tp) {
        const t = tp as any
        setTpId(t.id)
        setHourlyRate(t.hourly_rate_usd ?? 15)
        setTrialRate(t.trial_rate_usd ?? 5)
        setYearsExp(t.years_experience ?? 1)
        setSpecializations(t.specializations ?? [])
        setLanguages((t.teaching_languages ?? []).join(', '))
        setAvailableDays(t.available_days ?? [])
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await (supabase.from('profiles') as any).update({
      first_name: firstName, last_name: lastName,
      bio, country, phone,
    }).eq('id', user.id)

    await (supabase.from('teacher_profiles') as any).update({
      hourly_rate_usd: hourlyRate,
      trial_rate_usd: trialRate,
      years_experience: yearsExp,
      specializations,
      teaching_languages: languages.split(',').map(l => l.trim()).filter(Boolean),
      available_days: availableDays,
    }).eq('id', tpId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleSpec(spec: CourseType) {
    setSpecializations(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])
  }

  function toggleDay(day: string) {
    setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0D3D20]">My Profile</h1>
          <p className="text-[#1B5E37]/60 text-sm mt-1">Students see this when browsing teachers.</p>
        </div>
        {saved && (
          <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold">
            ✓ Saved!
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : (
        <div className="space-y-6">

          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
            <h2 className="font-bold text-[#0D3D20] mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Email</label>
                <input value={email} disabled
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm bg-[#F5F0E8] text-[#1B5E37]/50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Country</label>
                <select value={country} onChange={e => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]">
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Tell students about yourself, your experience, and teaching style..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37] resize-none" />
              </div>
            </div>
          </div>

          {/* Teaching info */}
          <div className="bg-white rounded-2xl border border-[#D4C99A] p-6">
            <h2 className="font-bold text-[#0D3D20] mb-4">Teaching Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Hourly Rate (USD)</label>
                <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Trial Rate (USD)</label>
                <input type="number" value={trialRate} onChange={e => setTrialRate(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Years Experience</label>
                <input type="number" value={yearsExp} onChange={e => setYearsExp(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#0D3D20] mb-1">Teaching Languages (comma separated)</label>
              <input value={languages} onChange={e => setLanguages(e.target.value)}
                placeholder="e.g. English, Urdu, Arabic"
                className="w-full px-3 py-2.5 rounded-xl border border-[#D4C99A] text-sm focus:outline-none focus:border-[#1B5E37]" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#0D3D20] mb-2">Specializations</label>
              <div className="flex flex-wrap gap-2">
                {COURSE_TYPES.map(spec => (
                  <button key={spec} onClick={() => toggleSpec(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      specializations.includes(spec)
                        ? 'bg-[#1B5E37] text-white border-[#1B5E37]'
                        : 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#1B5E37]'
                    }`}>
                    {COURSE_LABELS[spec]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0D3D20] mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button key={day} onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      availableDays.includes(day)
                        ? 'bg-[#B8952A] text-white border-[#B8952A]'
                        : 'bg-white text-[#1B5E37] border-[#D4C99A] hover:border-[#B8952A]'
                    }`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#1B5E37] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0D3D20] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  )
}
