// src/app/cookie-policy/page.tsx
'use client'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const SECTIONS = [
  { title: '1. What Are Cookies', content: `Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies help us recognise your device and remember your preferences.` },
  { title: '2. How We Use Cookies', content: `We use cookies to: keep you signed in to your account; remember your preferences (such as language); understand how you use our platform; improve our services based on usage data; and provide relevant functionality. We do not use cookies for advertising or to track you across other websites.` },
  { title: '3. Types of Cookies We Use', content: `Essential Cookies: Required for the platform to function. These include session cookies that keep you logged in. They cannot be disabled. Preference Cookies: Remember your settings such as language and timezone. Analytics Cookies: Help us understand how visitors use our platform so we can improve it. We use anonymised data only.` },
  { title: '4. Third-Party Cookies', content: `Some cookies on our platform are set by third-party services we use, including Supabase (authentication), Stripe (payments), and Daily.co (video lessons). These services have their own privacy policies and we encourage you to review them. We do not have control over cookies set by third parties.` },
  { title: '5. Managing Cookies', content: `You can control and manage cookies in your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or be notified when a cookie is being set. Please note that disabling essential cookies may prevent you from using certain features of our platform, including logging in to your account.` },
  { title: '6. Cookie Retention', content: `Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period (usually 30–90 days) or until you delete them. You can view and delete cookies stored by our platform through your browser's developer tools.` },
  { title: '7. Updates to This Policy', content: `We may update this Cookie Policy from time to time to reflect changes in technology or legislation. We will notify you of any significant changes by posting a notice on our platform. The date at the top of this policy indicates when it was last updated.` },
  { title: '8. Contact Us', content: `If you have questions about our use of cookies, please contact us at info@quranmentorglobal.com. We are happy to explain our practices in more detail and address any concerns you may have.` },
]

export default function CookiePolicyPage() {
  return (
    <>
      <style>{LANDING_CSS + `
        .legal-page { padding: 80px 0 100px; background: #fff; }
        .legal-inner { max-width: 780px; margin: 0 auto; }
        .legal-meta { font-size: 14px; color: var(--tl); margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid var(--cream-d); }
        .legal-section { margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid var(--cream-d); }
        .legal-section:last-child { border-bottom: none; }
        .legal-section h2 { font-family: var(--ff); font-size: 20px; font-weight: 700; color: var(--green-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
        .legal-section h2::before { content: ''; width: 4px; height: 22px; background: linear-gradient(var(--green), var(--gold)); border-radius: 2px; flex-shrink: 0; }
        .legal-section p { font-size: 15px; color: var(--tm); line-height: 1.85; }
        .legal-nav { background: var(--cream); border-radius: 16px; padding: 24px 28px; margin-bottom: 48px; }
        .legal-nav h3 { font-size: 13px; font-weight: 700; color: var(--green-dark); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
        .legal-nav ul { display: flex; flex-direction: column; gap: 8px; }
        .legal-nav ul li a { font-size: 14px; color: var(--green); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: gap .2s; }
        .legal-nav ul li a:hover { gap: 10px; }
        .cookie-types { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin: 20px 0; }
        .cookie-type { background: var(--cream); border-radius: 12px; padding: 20px; border: 1px solid var(--cream-d); }
        .cookie-type h4 { font-size: 14px; font-weight: 700; color: var(--green-dark); margin-bottom: 6px; }
        .cookie-type p { font-size: 12px; color: var(--tl); line-height: 1.6; }
        .legal-links { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--cream-d); }
        .legal-links a { font-size: 14px; color: var(--green); font-weight: 600; text-decoration: none; }
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:1;box-shadow:0 4px 20px rgba(27,94,55,.4)}
        @media(max-width:600px){.cookie-types{grid-template-columns:1fr}}
      `}</style>

      <LandingNav />

      <section style={{background:'linear-gradient(135deg,#0D3D20,#1B5E37)',padding:'80px 0 60px',textAlign:'center',position:'relative'}}>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Cookie Policy</span></div>
          <h1 style={{fontFamily:'var(--ff)',fontSize:'clamp(28px,4vw,50px)',fontWeight:800,color:'#fff',marginBottom:12}}>Cookie <span style={{color:'var(--gold-light)'}}>Policy</span></h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.72)',maxWidth:480,margin:'0 auto'}}>How we use cookies and similar technologies on our platform.</p>
        </div>
      </section>

      <section className="legal-page">
        <div className="container">
          <div className="legal-inner">
            <div className="legal-meta">
              <strong>Last Updated:</strong> January 2025 &nbsp;·&nbsp; Questions? <a href="mailto:info@quranmentorglobal.com" style={{color:'var(--green)'}}>Contact us</a>
            </div>

            <div className="cookie-types">
              {[
                { ico:'🔒', title:'Essential', desc:'Required for login and core platform functionality. Cannot be disabled.' },
                { ico:'⚙️', title:'Preference', desc:'Remember your language, timezone and display settings.' },
                { ico:'📊', title:'Analytics', desc:'Anonymised data to help us improve the platform experience.' },
              ].map((t,i) => (
                <div className="cookie-type" key={i}>
                  <div style={{fontSize:24,marginBottom:8}}>{t.ico}</div>
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>

            <div className="legal-nav">
              <h3>Contents</h3>
              <ul>{SECTIONS.map((s,i) => <li key={i}><a href={`#s${i}`}>→ {s.title}</a></li>)}</ul>
            </div>

            {SECTIONS.map((s, i) => (
              <div className="legal-section" key={i} id={`s${i}`}>
                <h2>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            ))}

            <div className="legal-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>↑</button>
    </>
  )
}
