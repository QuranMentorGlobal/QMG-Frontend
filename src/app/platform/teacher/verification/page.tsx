'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'

const SPECIALIZATIONS = ['Noorani Qaida', 'Tajweed', 'Hifz', 'Tafseer', 'Islamic Studies', 'Ijazah']
const LANGUAGES = ['English', 'Urdu', 'Arabic', 'Pashto', 'Bengali', 'French', 'Turkish']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const COUNTRIES = ['Pakistan', 'United Kingdom', 'United States', 'UAE', 'Saudi Arabia', 'Canada', 'Australia', 'Bangladesh', 'India', 'Other']

type Status = 'not_submitted' | 'pending' | 'approved' | 'rejected'

function Toggle({ items, selected, onToggle, color = '#1B5E37' }: {
  items: string[]
  selected: string[]
  onToggle: (v: string) => void
  color?: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onToggle(item)}
          className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
          style={selected.includes(item)
            ? { background: color, color: '#fff', borderColor: color }
            : { background: '#fff', color: '#6B6B6B', borderColor: '#E0DDD5' }}>
          {item}
        </button>
      ))}
    </div>
  )
}

export default function VerificationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<Status>('not_submitted')
  const [rejectionReason, setRejectionReason] = useState('')
  const [tpId, setTpId] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [toast, setToast] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const [firstName, setFirstName]             = useState('')
  const [lastName, setLastName]               = useState('')
  const [gender, setGender]                   = useState('')
  const [country, setCountry]                 = useState('')
  const [phone, setPhone]                     = useState('')
  const [bio, setBio]                         = useState('')
  const [photoUrl, setPhotoUrl]               = useState('')
  const [yearsExp, setYearsExp]               = useState('')
  const [ijazah, setIjazah]                   = useState(false)
  const [specializations, setSpecializations] = useState<string[]>([])
  const [languages, setLanguages]             = useState<string[]>([])
  const [availableDays, setAvailableDays]     = useState<string[]>([])
  const [hourlyRate, setHourlyRate]           = useState('')
  const [trialRate, setTrialRate]             = useState('')
  const [agreedTerms, setAgreedTerms]         = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      setUserEmail(user.email || '')

      const { data: prof } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        const p = prof as any
        if (p.role !== 'teacher') { router.replace('/platform/student/dashboard'); return }
        setFirstName(p.first_name || '')
        setLastName(p.last_name || '')
        setGender(p.gender || '')
        setCountry(p.country || '')
        setPhone(p.phone || '')
        setBio(p.bio || '')
        setPhotoUrl(p.avatar_url || '')
      }

      const { data: tp } = await supabase
        .from('teacher_profiles').select('*').eq('user_id', user.id).single()
      if (tp) {
        const t = tp as any
        setTpId(t.id)
        setStatus(t.status || 'not_submitted')
        setRejectionReason(t.rejection_reason || '')
        setYearsExp(t.years_experience?.toString() || '')
        setIjazah(t.ijazah_verified || false)
        setSpecializations(t.specializations || [])
        setLanguages(t.teaching_languages || [])
        setAvailableDays(t.available_days || [])
        setHourlyRate(t.hourly_rate_usd?.toString() || '')
        setTrialRate(t.trial_rate_usd?.toString() || '')
        if (t.profile_photo_url) setPhotoUrl(t.profile_photo_url)
      }

      setLoading(false)
    }
    load()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function toggle(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('Photo must be under 5MB'); return }
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { showToast('Upload failed. Try again.'); setUploadingPhoto(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    setPhotoUrl(urlData.publicUrl)
    setUploadingPhoto(false)
    showToast('✅ Photo uploaded!')
  }

  function validateStep(s: number) {
    if (s === 1) {
      if (!firstName || !lastName || !gender || !country || !bio) {
        showToast('Please fill in all fields in this step.'); return false
      }
      if (!photoUrl) { showToast('Please upload a profile photo.'); return false }
    }
    if (s === 2) {
      if (!yearsExp || specializations.length === 0) {
        showToast('Please fill in experience and select at least one specialization.'); return false
      }
    }
    if (s === 3) {
      if (languages.length === 0 || availableDays.length === 0 || !hourlyRate) {
        showToast('Please fill in all teaching details.'); return false
      }
    }
    if (s === 4) {
      if (!agreedTerms) { showToast('Please agree to the terms to submit.'); return false }
    }
    return true
  }

  function nextStep() {
    if (validateStep(step)) setStep(step + 1)
  }

  async function handleSubmit() {
    if (!validateStep(4)) return
    setSubmitting(true)

    await (supabase.from('profiles') as any).update({
      first_name: firstName,
      last_name: lastName,
      gender,
      country,
      phone,
      bio,
      avatar_url: photoUrl,
    }).eq('id', userId)

    const updateData: any = {
      status: 'pending',
      submitted_at: new Date().toISOString(),
      years_experience: Number(yearsExp),
      ijazah_verified: ijazah,
      specializations,
      teaching_languages: languages,
      available_days: availableDays,
      hourly_rate_usd: Number(hourlyRate),
      trial_rate_usd: Number(trialRate) || 0,
      profile_photo_url: photoUrl,
      rejection_reason: null,
    }

    if (tpId) {
      await (supabase.from('teacher_profiles') as any).update(updateData).eq('id', tpId)
    } else {
      await (supabase.from('teacher_profiles') as any).insert({ ...updateData, user_id: userId })
    }

    // Notify admin by email
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_application',
          teacherName: `${firstName} ${lastName}`,
          teacherEmail: userEmail,
          specializations,
        }),
      })
    } catch (e) {
      console.error('Email notification failed:', e)
    }

    setStatus('pending')
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid #1B5E37', borderTopColor: 'transparent' }} />
    </div>
  )

  // ── APPROVED ──────────────────────────────────────────────
  if (status === 'approved') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#E8F5EE' }}>
          <ShieldCheck size={40} style={{ color: '#1B5E37' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#0D3D20', fontFamily: 'Playfair Display, serif' }}>
          You're Verified! ✅
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B6B6B' }}>
          Your profile is now live and visible to students. Start adding courses and accepting bookings.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <a href="/platform/teacher/courses"
            className="py-3 rounded-xl text-white text-sm font-bold text-center transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1B5E37, #0D3D20)' }}>
            Add Courses
          </a>
          <a href="/platform/teacher/profile"
            className="py-3 rounded-xl text-sm font-bold text-center border transition-all hover:bg-gray-50"
            style={{ borderColor: '#E0DDD5', color: '#1B5E37' }}>
            Edit Profile
          </a>
        </div>
      </div>
    </div>
  )

  // ── PENDING ───────────────────────────────────────────────
  if (status === 'pending') return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#FEF3C7' }}>
          <Clock size={40} style={{ color: '#D97706' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#0D3D20', fontFamily: 'Playfair Display, serif' }}>
          Application Under Review 🟡
        </h1>
        <p className="text-sm mb-4" style={{ color: '#6B6B6B' }}>
          Our team is reviewing your application. This usually takes 24–48 hours.
          You'll receive an email once a decision has been made.
        </p>
        <div className="px-6 py-4 rounded-xl text-sm text-left" style={{ background: '#F5F0E8' }}>
          <p className="font-semibold mb-2" style={{ color: '#1A1A1A' }}>While you wait:</p>
          <ul className="space-y-1 list-disc list-inside" style={{ color: '#6B6B6B' }}>
            <li>Prepare your course content</li>
            <li>Set up your availability schedule</li>
            <li>Make sure your profile photo is clear and professional</li>
          </ul>
        </div>
      </div>
    </div>
  )

  // ── REJECTED ──────────────────────────────────────────────
  if (status === 'rejected') return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: '#FECACA' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FEE2E2' }}>
            <XCircle size={24} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#DC2626' }}>Application Not Approved</h2>
            <p className="text-sm mb-3" style={{ color: '#6B6B6B' }}>
              Don't worry — you can update your application and resubmit.
            </p>
            {rejectionReason && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B' }}>
                <p className="font-semibold mb-1">Reason from admin:</p>
                <p>{rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => setStatus('not_submitted')}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #1B5E37, #0D3D20)' }}>
        Update & Resubmit Application →
      </button>
    </div>
  )

  // ── FORM ──────────────────────────────────────────────────
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Qualifications' },
    { number: 3, label: 'Teaching Info' },
    { number: 4, label: 'Declaration' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold"
          style={{ background: '#0D3D20' }}>
          {toast}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B5E37, #0D3D20)' }}>
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0D3D20', fontFamily: 'Playfair Display, serif' }}>
              Teacher Verification
            </h1>
            <p className="text-sm" style={{ color: '#6B6B6B' }}>
              Complete your profile to get listed publicly and start teaching
            </p>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step > s.number ? '#1B5E37' : step === s.number ? '#B8952A' : '#E0DDD5',
                  color: step >= s.number ? '#fff' : '#9CA3AF'
                }}>
                {step > s.number ? '✓' : s.number}
              </div>
              <span className="text-xs font-medium hidden sm:block"
                style={{ color: step === s.number ? '#B8952A' : step > s.number ? '#1B5E37' : '#9CA3AF' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-px flex-shrink-0"
                style={{ background: step > s.number ? '#1B5E37' : '#E0DDD5' }} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Personal Information</h2>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#3D3D3D' }}>
                Profile Photo * <span className="font-normal text-xs" style={{ color: '#6B6B6B' }}>(clear, professional, face visible)</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: photoUrl ? 'transparent' : '#F0E4B8', border: '2px dashed #B8952A' }}>
                  {photoUrl
                    ? <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                    : <span className="text-3xl">👤</span>}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50 inline-flex items-center gap-2"
                      style={{ borderColor: '#E0DDD5', color: '#1B5E37' }}>
                      <Upload size={15} />
                      {uploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload}
                      className="hidden" disabled={uploadingPhoto} />
                  </label>
                  <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>JPG, PNG or WEBP · Max 5MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>First Name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Ahmad / Fatima"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E0DDD5' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>Last Name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Khan / Ali"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#E0DDD5' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: '#3D3D3D' }}>Gender *</label>
              <div className="flex gap-3">
                {['male', 'female'].map(g => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all capitalize"
                    style={gender === g
                      ? { background: '#1B5E37', color: '#fff', borderColor: '#1B5E37' }
                      : { background: '#fff', color: '#6B6B6B', borderColor: '#E0DDD5' }}>
                    {g === 'male' ? '👨 Male' : '👩 Female'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>Country *</label>
              <select value={country} onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#E0DDD5', color: country ? '#1A1A1A' : '#9CA3AF' }}>
                <option value="">Select your country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#E0DDD5' }} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>
                About You * <span className="font-normal text-xs" style={{ color: '#6B6B6B' }}>(shown on your public profile)</span>
              </label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                placeholder="Tell students about your background, teaching style, and what makes your lessons special..."
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none leading-relaxed"
                style={{ borderColor: '#E0DDD5' }} />
              <p className="text-xs mt-1 text-right" style={{ color: '#9CA3AF' }}>{bio.length}/500</p>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <h2 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Qualifications</h2>

            <div>
              <label className="block text-sm font-bold mb-1.5" style={{ color: '#3D3D3D' }}>
                Years of Teaching Experience *
              </label>
              <input type="number" min="0" max="50" value={yearsExp}
                onChange={e => setYearsExp(e.target.value)} placeholder="e.g. 5"
                className="w-32 px-4 py-3 rounded-xl border text-sm outline-none text-center font-bold"
                style={{ borderColor: '#E0DDD5' }} />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#3D3D3D' }}>Do you have Ijazah?</label>
              <p className="text-xs mb-3" style={{ color: '#6B6B6B' }}>
                An Ijazah is a certificate authorizing you to transmit the Quran. Teachers with Ijazah get more bookings.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIjazah(true)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={ijazah
                    ? { background: '#1B5E37', color: '#fff', borderColor: '#1B5E37' }
                    : { background: '#fff', color: '#6B6B6B', borderColor: '#E0DDD5' }}>
                  ✅ Yes, I have Ijazah
                </button>
                <button type="button" onClick={() => setIjazah(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={!ijazah
                    ? { background: '#6B7280', color: '#fff', borderColor: '#6B7280' }
                    : { background: '#fff', color: '#6B6B6B', borderColor: '#E0DDD5' }}>
                  No Ijazah
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#3D3D3D' }}>
                Specializations * <span className="font-normal text-xs" style={{ color: '#6B6B6B' }}>(select all that apply)</span>
              </label>
              <p className="text-xs mb-3" style={{ color: '#6B6B6B' }}>What subjects can you teach?</p>
              <Toggle items={SPECIALIZATIONS} selected={specializations}
                onToggle={v => toggle(specializations, setSpecializations, v)} />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="p-6 space-y-6">
            <h2 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Teaching Details</h2>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#3D3D3D' }}>
                Teaching Languages * <span className="font-normal text-xs" style={{ color: '#6B6B6B' }}>(select all that apply)</span>
              </label>
              <p className="text-xs mb-3" style={{ color: '#6B6B6B' }}>Which languages can you teach in?</p>
              <Toggle items={LANGUAGES} selected={languages}
                onToggle={v => toggle(languages, setLanguages, v)} color="#B8952A" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#3D3D3D' }}>
                Available Days * <span className="font-normal text-xs" style={{ color: '#6B6B6B' }}>(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map(d => (
                  <button key={d} type="button"
                    onClick={() => toggle(availableDays, setAvailableDays, d)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={availableDays.includes(d)
                      ? { background: '#0D3D20', color: '#fff', borderColor: '#0D3D20' }
                      : { background: '#fff', color: '#6B6B6B', borderColor: '#E0DDD5' }}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#3D3D3D' }}>Your Rates (USD) *</label>
              <p className="text-xs mb-4" style={{ color: '#6B6B6B' }}>
                Average on our platform is $8–$15/hr. Set a competitive rate to attract more students.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B6B6B' }}>Hourly Rate *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#6B6B6B' }}>$</span>
                    <input type="number" min="1" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)}
                      placeholder="10"
                      className="w-full pl-7 pr-4 py-3 rounded-xl border text-sm outline-none font-bold"
                      style={{ borderColor: '#E0DDD5' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6B6B6B' }}>Trial Lesson Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#6B6B6B' }}>$</span>
                    <input type="number" min="0" value={trialRate} onChange={e => setTrialRate(e.target.value)}
                      placeholder="0 = free"
                      className="w-full pl-7 pr-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ borderColor: '#E0DDD5' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="p-6 space-y-5">
            <h2 className="font-bold text-lg" style={{ color: '#1A1A1A' }}>Declaration & Submission</h2>

            <div className="rounded-xl p-4 space-y-3" style={{ background: '#F5F0E8' }}>
              <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>Application Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Name', value: `${firstName} ${lastName}` },
                  { label: 'Gender', value: gender || '—' },
                  { label: 'Country', value: country || '—' },
                  { label: 'Experience', value: `${yearsExp} years` },
                  { label: 'Ijazah', value: ijazah ? 'Yes ✓' : 'No' },
                  { label: 'Hourly Rate', value: hourlyRate ? `$${hourlyRate}` : '—' },
                  { label: 'Specializations', value: specializations.join(', ') || '—' },
                  { label: 'Languages', value: languages.join(', ') || '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-semibold" style={{ color: '#6B6B6B' }}>{label}</p>
                    <p className="font-medium capitalize" style={{ color: '#1A1A1A' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 border" style={{ borderColor: '#E0DDD5' }}>
              <p className="text-sm font-bold mb-3" style={{ color: '#1A1A1A' }}>Platform Terms for Teachers</p>
              <ul className="text-xs space-y-2" style={{ color: '#6B6B6B' }}>
                {[
                  'I confirm all information provided is accurate and truthful',
                  'QuranMentorGlobal takes a 10–15% commission on each lesson',
                  'I will maintain professional conduct with all students',
                  'I will be punctual and prepared for every lesson',
                  'I understand my profile will be reviewed before going public',
                  "I agree to the platform's Code of Conduct and Privacy Policy",
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: '#1B5E37', marginTop: '1px' }}>✓</span>
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 flex-shrink-0" style={{ accentColor: '#1B5E37' }} />
              <span className="text-sm leading-relaxed" style={{ color: '#3D3D3D' }}>
                I have read and agree to all the terms above. I confirm that all information in this application is accurate.
              </span>
            </label>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#E8F5EE' }}>
              <AlertCircle size={16} style={{ color: '#1B5E37', marginTop: '2px', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: '#1B5E37' }}>
                After submission, our team will review your application within <strong>24–48 hours</strong>.
                You'll receive an email notification once a decision is made.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#F3F4F6' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
              style={{ borderColor: '#E0DDD5', color: '#6B6B6B' }}>
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={nextStep}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1B5E37, #0D3D20)' }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #B8952A, #D4AF50)' }}>
              {submitting ? 'Submitting...' : '🚀 Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
