'use client'
import { LandingNav, LandingFooter, SocialIcons, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <style>{LANDING_CSS + `
        .founder{padding:100px 0;background:#fff;overflow:hidden}
        .founder-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .founder-main{border-radius:28px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.14);aspect-ratio:4/3}
        .founder-main img{width:100%;height:100%;object-fit:cover}
        .founder-creds{display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
        .cred{display:flex;gap:15px;padding:14px;border-radius:12px;transition:background .2s}
        .cred:hover{background:var(--cream)}
        .cred-ico{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
        .cred-b h4{font-size:15px;font-weight:700;color:var(--green-dark);margin-bottom:3px}
        .cred-b p{font-size:13px;color:var(--tl);line-height:1.6}
        .mission{padding:100px 0;background:var(--cream);overflow:hidden}
        .mgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .mcard{background:#fff;border-radius:20px;padding:32px;border:1px solid var(--cream-d);transition:all .4s;text-align:center}
        .mcard:hover{box-shadow:0 20px 50px rgba(0,0,0,.09);transform:translateY(-6px)}
        .mcard-ico{font-size:48px;margin-bottom:16px}
        .mcard h3{font-family:var(--ff);font-size:20px;font-weight:700;color:var(--green-dark);margin-bottom:10px}
        .mcard p{font-size:14px;color:var(--tl);line-height:1.7}
        .stats-row{padding:80px 0;background:linear-gradient(135deg,var(--green) 0%,var(--green-dark) 100%)}
        .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center}
        .si .big{font-family:var(--ff);font-size:clamp(38px,5vw,54px);font-weight:800;color:var(--gold-light);line-height:1;margin-bottom:8px}
        .si .lbl{font-size:14px;color:rgba(255,255,255,.62)}
        .team{padding:100px 0;background:#fff}
        .tgrid2{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .tmem{text-align:center}
        .tmem-img{width:120px;height:120px;border-radius:50%;overflow:hidden;margin:0 auto 14px;border:3px solid var(--gold-pale)}
        .tmem-img img{width:100%;height:100%;object-fit:cover}
        .tmem h4{font-family:var(--ff);font-size:16px;font-weight:700;color:var(--green-dark);margin-bottom:3px}
        .tmem p{font-size:13px;color:var(--tl)}
        @media(max-width:860px){.founder-inner{grid-template-columns:1fr;gap:48px}.mgrid{grid-template-columns:1fr 1fr}.tgrid2{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.mgrid{grid-template-columns:1fr}.sgrid{grid-template-columns:repeat(2,1fr)}.tgrid2{grid-template-columns:1fr 1fr}}
      `}</style>

      <LandingNav />

      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>About Us</span></div>
          <div className="sl center wh">Our Story</div>
          <h1>Born from <span>Purpose</span>,<br/>Built on Faith</h1>
          <p>Learn how a Hafiz-e-Quran with a vision set out to make authentic Quranic education accessible to every Muslim on earth.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      {/* Founder */}
      <section className="founder">
        <div className="container">
          <div className="founder-inner">
            <div>
              <div className="founder-main">
                <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80" alt="Hafiz Awais - Founder" loading="lazy" />
              </div>
            </div>
            <div>
              <div className="sl">The Founder</div>
              <h2 className="st">Meet <span>Hafiz Awais</span></h2>
              <p className="ss">Hafiz Awais completed his Hifz at a young age and went on to pursue professional studies in accounting (ACCA). But the love for Quran education never left him — it grew into a calling.</p>
              <p className="ss" style={{marginTop:16,marginBottom:28}}>He noticed a recurring problem: Muslim families in the West, Gulf, and even Pakistan struggling to find qualified, trustworthy Quran teachers for their children. The solution became Quran Mentor Global.</p>
              <div className="founder-creds">
                {[
                  { ico:'📖', title:'Hafiz-e-Quran', desc:'Memorized the complete Quran at age 14 with full Tajweed under certified Qaris' },
                  { ico:'🎓', title:'ACCA Professional', desc:'Qualified accountant — bringing professional standards and accountability to online education' },
                  { ico:'🌍', title:'Global Vision', desc:'Passionate about connecting the worldwide Ummah through the sacred bond of Quranic learning' },
                ].map((c, i) => (
                  <div className="cred" key={i}>
                    <div className="cred-ico">{c.ico}</div>
                    <div className="cred-b"><h4>{c.title}</h4><p>{c.desc}</p></div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn btn-green">Start Learning Today →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mission">
        <div className="container">
          <div className="section-hd">
            <div className="sl center">Our Mission</div>
            <h2 className="st">Why We <span>Built This</span></h2>
            <p className="ss">Three core beliefs that guide everything we do at Quran Mentor Global.</p>
          </div>
          <div className="mgrid">
            {[
              { ico:'🕌', title:'Accessibility First', desc:'Every Muslim — regardless of location, age, or background — deserves access to quality Quranic education. We remove every barrier.' },
              { ico:'✅', title:'Quality & Trust', desc:'We verify every teacher before they teach. Ijazah certification, background checks, and student reviews ensure you always get the best.' },
              { ico:'🌍', title:'Global Community', desc:'We are building a worldwide community of learners united by the Quran — from Pakistan to London to Houston to Dubai.' },
            ].map((m, i) => (
              <div className="mcard" key={i}>
                <div className="mcard-ico">{m.ico}</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-row">
        <div className="container">
          <div className="sgrid">
            <div className="si"><div className="big">10K+</div><div className="lbl">Happy Students</div></div>
            <div className="si"><div className="big">500+</div><div className="lbl">Certified Teachers</div></div>
            <div className="si"><div className="big">100+</div><div className="lbl">Countries Connected</div></div>
            <div className="si"><div className="big">4.9★</div><div className="lbl">Average Rating</div></div>
          </div>
        </div>
      </section>

      {/* Hadith */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src">— Sahih Al-Bukhari</p>
        </div>
      </div>

      {/* CTA */}
      <section style={{padding:'100px 0',background:'var(--cream)'}}>
        <div className="container" style={{textAlign:'center'}}>
          <div className="sl center">Join Us</div>
          <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Begin Your <span>Quranic Journey</span></h2>
          <p className="ss" style={{margin:'0 auto 32px',textAlign:'center'}}>Join thousands of students worldwide who have found their perfect Quran teacher through our platform.</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/signup" className="btn btn-gold">Sign Up Free ✦</Link>
            <Link href="/platform/teachers" className="btn btn-outline-green">Browse Teachers →</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
