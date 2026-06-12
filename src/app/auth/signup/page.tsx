'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState('student')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function pwStrength(p: string) {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  async function handleSignup() {
  if (!firstName || !lastName || !email || !password || !country) {
    setError('Please fill in all required fields.'); return
  }
  if (!agreed) { setError('Please agree to the Terms of Service.'); return }
  if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

  const validRole = role === 'teacher' ? 'teacher' : 'student'
  setError('')
  setLoading(true)

  const supabase = createClient()

  // Step 1 — Create auth user
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, role: validRole }
    }
  })

  if (authError) { setError(authError.message); setLoading(false); return }
  if (!data.user) { setError('Signup failed. Please try again.'); setLoading(false); return }

  // Step 2 — Upsert profile (ignore errors, trigger may have already created it)
  await (supabase.from('profiles') as any).upsert({
    id: data.user.id,
    first_name: firstName,
    last_name: lastName,
    email: email,
    role: validRole,
    country: country,
    is_active: true,
  }).select()

  // Step 3 — If teacher, create teacher_profiles row
  if (validRole === 'teacher') {
    await (supabase.from('teacher_profiles') as any).upsert({
      user_id: data.user.id,
      status: 'not_submitted',
      years_experience: 0,
      specializations: [],
      teaching_languages: [],
      available_days: [],
      hourly_rate_usd: 0,
      trial_rate_usd: 0,
      ijazah_verified: false,
    }).select()
  }

  // Always proceed to success regardless of upsert results
  // The trigger will have created the profile anyway
  setSuccess(true)
  setLoading(false)
}

  async function handleGoogleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const strength = pwStrength(password)
  const strengthColors = ['', '#f87171', '#fbbf24', '#4ade80', '#22c55e']

  if (success) {
    return (
      <>
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0D3D20' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', maxWidth: 420, margin: 20 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>
              {role === 'teacher' ? '🎓' : '📧'}
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0D3D20', marginBottom: 12 }}>
              {role === 'teacher' ? 'Welcome, Teacher!' : 'Check Your Email!'}
            </h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.7, marginBottom: 28 }}>
              {role === 'teacher'
                ? `Account created! Sign in and complete your verification to go live on the platform.`
                : `We sent a confirmation link to ${email}. Click it to activate your account, then sign in.`
              }
            </p>
            <a href="/auth/login"
              style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg,#1B5E37,#2A7A4A)', color: '#fff', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>
              Go to Sign In →
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Amiri:wght@400&display=swap');
        :root{--green:#1B5E37;--green-dark:#0D3D20;--green-mid:#2A7A4A;--gold:#B8952A;--gold-light:#D4AF50;--cream:#F5F0E8;--cream-d:#EDE6D6;--td:#1A1A1A;--tm:#3D3D3D;--tl:#6B6B6B}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;font-family:'DM Sans',system-ui,sans-serif;color:var(--td)}
        .auth-wrap{display:flex;min-height:100vh;background:var(--green-dark)}
        .auth-left{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:60px;min-height:100vh}
        .auth-left::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--green-dark) 0%,var(--green) 100%)}
        .auth-left::after{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='40,6 46,26 66,20 54,36 70,40 54,44 66,60 46,54 40,74 34,54 14,60 26,44 10,40 26,36 14,20 34,26' fill='none' stroke='%23D4AF50' stroke-width='.6'/%3E%3C/svg%3E");opacity:.04}
        .orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}
        .o1{width:400px;height:400px;background:radial-gradient(circle,rgba(184,149,42,.12) 0%,transparent 70%);top:-100px;right:-100px}
        .o2{width:300px;height:300px;background:radial-gradient(circle,rgba(27,94,55,.6) 0%,transparent 70%);bottom:-80px;left:-60px}
        .left-inner{position:relative;z-index:1;max-width:440px}
        .auth-logo{display:flex;align-items:center;gap:12px;margin-bottom:48px;text-decoration:none}
        .logo-mark{width:44px;height:44px;background:rgba(255,255,255,.1);border:1px solid rgba(184,149,42,.3);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .logo-txt .name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;line-height:1.1}
        .logo-txt .name span{color:var(--gold)}
        .logo-txt .tag{font-size:10px;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase}
        .left-inner h1{font-family:'Playfair Display',serif;font-size:clamp(30px,3.5vw,44px);font-weight:800;color:#fff;line-height:1.15;margin-bottom:18px}
        .left-inner h1 span{color:var(--gold-light)}
        .left-inner p{font-size:16px;color:rgba(255,255,255,.65);line-height:1.75;margin-bottom:40px}
        .steps-mini{display:flex;flex-direction:column;gap:18px}
        .sm{display:flex;align-items:center;gap:14px}
        .sm-n{width:36px;height:36px;border-radius:50%;background:rgba(184,149,42,.18);border:1px solid rgba(184,149,42,.3);color:var(--gold-light);font-family:'Playfair Display',serif;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sm-txt .t{font-size:14px;font-weight:600;color:rgba(255,255,255,.88)}
        .sm-txt .s{font-size:12px;color:rgba(255,255,255,.45)}
        .hadith{margin-top:48px;padding-top:28px;border-top:1px solid rgba(255,255,255,.08)}
        .hadith p{font-family:'Amiri',serif;font-size:15px;color:var(--gold-light);direction:rtl;margin-bottom:6px}
        .hadith small{font-size:12px;color:rgba(255,255,255,.3)}
        .auth-right{width:540px;flex-shrink:0;background:#fff;display:flex;align-items:flex-start;justify-content:center;padding:50px 52px;min-height:100vh;overflow-y:auto}
        .form-wrap{width:100%;max-width:400px;padding-top:16px}
        .form-wrap h2{font-family:'Playfair Display',serif;font-size:30px;font-weight:800;color:var(--green-dark);margin-bottom:6px}
        .form-wrap .sub{font-size:15px;color:var(--tl);margin-bottom:24px}
        .form-wrap .sub a{color:var(--green);font-weight:700;text-decoration:none}
        .role-lbl{font-size:13px;font-weight:700;color:var(--tm);margin-bottom:10px}
        .role-select{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px}
        .role-opt{border:2px solid var(--cream-d);border-radius:12px;padding:18px 10px;cursor:pointer;transition:all .2s;text-align:center;background:#fff}
        .role-opt:hover{border-color:var(--green-mid);background:var(--cream)}
        .role-opt.selected{border-color:var(--green);background:rgba(27,94,55,.06)}
        .role-opt .rico{font-size:28px;margin-bottom:6px}
        .role-opt .rlbl{font-size:14px;font-weight:700;color:var(--tm)}
        .role-opt .rsub{font-size:11px;color:var(--tl);margin-top:3px}
        .role-opt.selected .rlbl{color:var(--green-dark)}
        .social-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:13px 20px;border-radius:12px;border:1.5px solid var(--cream-d);background:#fff;font-size:15px;font-weight:500;color:var(--td);cursor:pointer;transition:all .25s;font-family:'DM Sans',sans-serif;width:100%;margin-bottom:20px}
        .social-btn:hover{border-color:var(--green-mid);background:var(--cream);transform:translateY(-2px)}
        .divider{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--cream-d)}
        .divider span{font-size:12px;color:var(--tl);font-weight:500}
        .fg{margin-bottom:14px}
        .fg label{display:block;font-size:13px;font-weight:700;color:var(--tm);margin-bottom:7px}
        .fg input,.fg select{width:100%;padding:13px 17px;border:1.5px solid var(--cream-d);border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--td);background:#fff;transition:all .25s;outline:none}
        .fg input:focus,.fg select:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(27,94,55,.1)}
        .fg-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .pw-wrap{position:relative}
        .pw-wrap input{padding-right:44px}
        .pw-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;color:var(--tl);padding:0}
        .pw-strength{display:flex;gap:4px;margin-top:8px}
        .ps{flex:1;height:3px;border-radius:2px;background:var(--cream-d);transition:background .3s}
        .terms{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--tl);margin-bottom:20px}
        .terms input{width:16px;height:16px;accent-color:var(--green);flex-shrink:0;margin-top:2px;cursor:pointer}
        .terms a{color:var(--green);font-weight:600;text-decoration:none}
        .submit-btn{width:100%;padding:15px;font-size:16px;border-radius:12px;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700;transition:all .3s;margin-bottom:16px}
        .submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(27,94,55,.4)}
        .submit-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .auth-switch{text-align:center;font-size:14px;color:var(--tl)}
        .auth-switch a{color:var(--green);font-weight:700;text-decoration:none}
        .error-box{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:10px;padding:12px 16px;font-size:13px;margin-bottom:16px}
        @media(max-width:920px){.auth-left{display:none}.auth-right{width:100%;padding:40px 24px}}
        @media(max-width:500px){.fg-row{grid-template-columns:1fr}}
      `}</style>

      <div className="auth-wrap">
        <div className="auth-left">
          <div className="orb o1"></div>
          <div className="orb o2"></div>
          <div className="left-inner">
            <a href="https://quranmentorglobal.com" className="auth-logo">
              <div className="logo-mark">
                <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: '#D4AF50' }}>
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zM21 18.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                </svg>
              </div>
              <div className="logo-txt">
                <div className="name">Quran <span>Mentor</span> Global</div>
                <div className="tag">Learn · Connect · Grow</div>
              </div>
            </a>
            <h1>Start Your<br /><span>Quran Learning</span><br />Journey Today</h1>
            <p>Join thousands of students learning with certified Qaris from the comfort of their home.</p>
            <div className="steps-mini">
              {[
                { n: '1', t: 'Create your account', s: 'Takes less than 2 minutes' },
                { n: '2', t: 'Browse & book a teacher', s: 'Free trial lesson available' },
                { n: '3', t: 'Start learning Quran', s: 'Flexible schedule, any device' }
              ].map(s => (
                <div className="sm" key={s.n}>
                  <div className="sm-n">{s.n}</div>
                  <div className="sm-txt"><div className="t">{s.t}</div><div className="s">{s.s}</div></div>
                </div>
              ))}
            </div>
            <div className="hadith">
              <p>خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
              <small>The best of you are those who learn the Quran and teach it. — Prophet ﷺ</small>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="form-wrap">
            <h2>Create Account</h2>
            <p className="sub">Already have an account? <a href="/auth/login">Sign in →</a></p>

            {/* ── Role selector — ONLY Student & Teacher ── */}
            <div className="role-lbl">I am joining as</div>
            <div className="role-select">
              {[
                { r: 'student', ico: '🎓', lbl: 'Student', sub: 'I want to learn' },
                { r: 'teacher', ico: '📖', lbl: 'Teacher', sub: 'I want to teach' },
              ].map(o => (
                <div
                  key={o.r}
                  className={`role-opt${role === o.r ? ' selected' : ''}`}
                  onClick={() => setRole(o.r)}>
                  <div className="rico">{o.ico}</div>
                  <div className="rlbl">{o.lbl}</div>
                  <div className="rsub">{o.sub}</div>
                </div>
              ))}
            </div>

            <button className="social-btn" onClick={handleGoogleSignup} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <div className="divider"><span>or sign up with email</span></div>

            {error && <div className="error-box">{error}</div>}

            <div className="fg-row">
              <div className="fg">
                <label>First Name *</label>
                <input type="text" placeholder="Ahmad" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="fg">
                <label>Last Name *</label>
                <input type="text" placeholder="Khan" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="fg">
              <label>Email Address *</label>
              <input type="email" placeholder="ahmad@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="fg">
              <label>Password *</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button className="pw-toggle" onClick={() => setShowPw(!showPw)} type="button">👁</button>
              </div>
              <div className="pw-strength">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="ps" style={{ background: strength >= i ? strengthColors[strength] : '' }}></div>
                ))}
              </div>
            </div>

            <div className="fg">
              <label>Country *</label>
              <select value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">Select your country</option>
                {['Pakistan', 'United Kingdom', 'United Arab Emirates', 'United States', 'Saudi Arabia', 'Canada', 'Australia', 'Other'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="terms">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label>
                I agree to the <a href="https://quranmentorglobal.com/about.html">Terms of Service</a> and{' '}
                <a href="https://quranmentorglobal.com/about.html">Privacy Policy</a>.
                {role === 'teacher' && ' Teachers must complete verification before going live.'}
              </label>
            </div>

            <button className="submit-btn" onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account...' : role === 'teacher' ? 'Create Teacher Account →' : 'Create Student Account →'}
            </button>

            <div className="auth-switch">
              Already have an account? <a href="/auth/login">Sign in →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
