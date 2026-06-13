// src/app/terms-of-service/page.tsx
'use client'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: `By accessing or using QuranMentorGlobal.com, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. These terms apply to all users — students, teachers, and parents.` },
  { title: '2. Platform Description', content: `Quran Mentor Global is an online marketplace that connects students seeking Quranic education with qualified Qari teachers. We facilitate the booking and payment of lessons but are not directly responsible for the content of individual lessons or the actions of individual teachers or students.` },
  { title: '3. User Accounts', content: `You must create an account to use our platform. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration. You must be at least 18 years old to create an account; minors may use the platform under parental supervision with a parent account.` },
  { title: '4. Teacher Obligations', content: `Teachers on our platform must maintain valid Ijazah certification and keep their credentials up to date. Teachers must conduct lessons professionally, punctually, and in accordance with our community guidelines. Teachers must not share contact details or attempt to move lessons off-platform. Teachers are responsible for the accuracy of their profile information. Commission rates of 10-15% apply to all transactions.` },
  { title: '5. Student Obligations', content: `Students must attend booked lessons punctually or provide at least 24 hours notice for cancellations. Students must treat teachers with respect and maintain appropriate conduct during lessons. Students are responsible for ensuring a suitable learning environment during video sessions. Misuse of the platform, including harassment of teachers, may result in account termination.` },
  { title: '6. Payment Terms', content: `All payments are processed securely through Stripe or JazzCash. Prices are displayed in USD. A platform commission of 10-15% is deducted from teacher earnings. Students are charged at the time of booking confirmation. Refunds may be issued in cases of technical failure or teacher no-show. We reserve the right to change pricing with 30 days notice.` },
  { title: '7. Cancellation Policy', content: `Students may cancel a lesson with at least 24 hours notice for a full refund. Cancellations within 24 hours of the lesson may incur a 50% cancellation fee. Teachers who cancel without notice will have their rating affected. Repeated cancellations by either party may result in account review.` },
  { title: '8. Intellectual Property', content: `All content on QuranMentorGlobal.com, including text, graphics, logos, and software, is the property of Quran Mentor Global and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.` },
  { title: '9. Prohibited Conduct', content: `Users are prohibited from: using the platform for any unlawful purpose; attempting to bypass our payment system; harassing, threatening, or abusing other users; uploading harmful or inappropriate content; impersonating any person or entity; attempting to gain unauthorized access to our systems; or using our platform to solicit students for off-platform services.` },
  { title: '10. Limitation of Liability', content: `Quran Mentor Global shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim. We do not guarantee continuous, uninterrupted access to our platform.` },
  { title: '11. Governing Law', content: `These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Lahore, Pakistan, unless local consumer protection laws require otherwise.` },
  { title: '12. Changes to Terms', content: `We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or a prominent notice on our platform. Continued use of the platform after changes constitutes acceptance of the new terms. If you do not agree to the new terms, you must discontinue use of the platform.` },
]

export default function TermsPage() {
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
        .legal-links { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--cream-d); }
        .legal-links a { font-size: 14px; color: var(--green); font-weight: 600; text-decoration: none; }
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:1;box-shadow:0 4px 20px rgba(27,94,55,.4)}
      `}</style>

      <LandingNav />

      <section style={{background:'linear-gradient(135deg,#0D3D20,#1B5E37)',padding:'80px 0 60px',textAlign:'center',position:'relative'}}>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Terms of Service</span></div>
          <h1 style={{fontFamily:'var(--ff)',fontSize:'clamp(28px,4vw,50px)',fontWeight:800,color:'#fff',marginBottom:12}}>Terms of <span style={{color:'var(--gold-light)'}}>Service</span></h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.72)',maxWidth:480,margin:'0 auto'}}>The rules and guidelines that govern your use of our platform.</p>
        </div>
      </section>

      <section className="legal-page">
        <div className="container">
          <div className="legal-inner">
            <div className="legal-meta">
              <strong>Last Updated:</strong> January 2025 &nbsp;·&nbsp; <strong>Effective Date:</strong> January 2025 &nbsp;·&nbsp; Questions? <a href="mailto:info@quranmentorglobal.com" style={{color:'var(--green)'}}>Contact us</a>
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
              <Link href="/cookie-policy">Cookie Policy</Link>
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
