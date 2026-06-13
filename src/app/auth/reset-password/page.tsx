'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Step 1: Request reset email ───────────────────────────────────────────
function RequestResetForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleRequest() {
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password?mode=update`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a password reset link to <strong>{email}</strong>.<br />
          Click the link in the email to set a new password.
        </p>
        <p className="text-xs text-gray-400">Didn't receive it? Check your spam folder or{' '}
          <button onClick={() => setSent(false)} className="text-green-700 underline">try again</button>.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRequest()}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
        />
      </div>

      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
        style={{ backgroundColor: '#1B5E37' }}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </>
  )
}

// ─── Step 2: Set new password (after clicking email link) ──────────────────
function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Supabase sends the user back with a session already active from the email link
  // We just need to call updateUser with the new password
  async function handleUpdate() {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Password updated!</h2>
        <p className="text-gray-500 text-sm">Redirecting you to login...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Set a new password</h2>
        <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUpdate()}
          placeholder="Same password again"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
        style={{ backgroundColor: '#1B5E37' }}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </>
  )
}

// ─── Main page wrapper ─────────────────────────────────────────────────────
function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') // 'update' when coming from email link

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="QuranMentorGlobal" className="h-12 mx-auto mb-3" />
          </Link>
          <p className="text-sm text-gray-500">QuranMentorGlobal.com</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {mode === 'update' ? <UpdatePasswordForm /> : <RequestResetForm />}
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-green-700 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
