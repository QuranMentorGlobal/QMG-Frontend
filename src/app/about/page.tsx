'use client'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <style>{LANDING_CSS + `
        /* ── Founder ── */
        .founder { padding: 100px 0; background: #fff; overflow: hidden; }
        .founder-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .founder-imgw { position: relative; }
        .founder-main { position: relative; /* 4:5 portrait */
          border-radius: var(--rx); overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,.14);
          aspect-ratio: 4/5; background: var(--cream-d);
        }
        .founder-main img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
        .founder-badge {
          position: absolute; bottom: -20px; right: -20px;
          background: linear-gradient(135deg, var(--green), var(--green-mid));
          color: #fff; border-radius: 16px; padding: 18px 22px;
          box-shadow: 0 8px 32px rgba(27,94,55,.35); text-align: center;
        }
        .founder-badge .num { font-family: var(--ff); font-size: 28px; font-weight: 800; color: var(--gold-light); line-height: 1; }
        .founder-badge .lbl { font-size: 11px; color: rgba(255,255,255,.65); margin-top: 3px; }
        .founder-creds { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
        .cred { display: flex; gap: 15px; padding: 14px; border-radius: 12px; transition: background .2s; }
        .cred:hover { background: var(--cream); }
        .cred-ico { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg,var(--green),var(--green-mid)); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .cred-b h4 { font-size: 15px; font-weight: 700; color: var(--green-dark); margin-bottom: 3px; }
        .cred-b p  { font-size: 13px; color: var(--tl); line-height: 1.6; }

        /* ── Why We Built This (alternating image-content) ── */
        .why { padding: 100px 0; background: var(--cream); overflow: hidden; }
        .why-item { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; margin-bottom: 80px; }
        .why-item:last-child { margin-bottom: 0; }
        .why-item.reverse { direction: rtl; }
        .why-item.reverse > * { direction: ltr; }
        .why-img { position: relative; border-radius: var(--rx); overflow: hidden; aspect-ratio: 4/3; background: var(--cream-d); box-shadow: var(--shl); }
        .why-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .why-tag { display: inline-flex; align-items: center; gap: 8px; background: var(--gold-pale); color: var(--green-dark); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 6px 14px; border-radius: 50px; margin-bottom: 16px; }

        /* ── Mission cards ── */
        .mission { padding: 100px 0; background: #fff; overflow: hidden; }
        .mgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .mcard { background: var(--cream); border-radius: 20px; padding: 36px 28px; border: 1px solid var(--cream-d); transition: all .4s; text-align: center; position: relative; overflow: hidden; }
        .mcard::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--green), var(--gold)); transform: scaleX(0); transition: transform .4s; transform-origin: left; }
        .mcard:hover { box-shadow: 0 20px 50px rgba(0,0,0,.09); transform: translateY(-6px); background: #fff; }
        .mcard:hover::before { transform: scaleX(1); }
        .mcard-ico { font-size: 44px; margin-bottom: 18px; }
        .mcard h3 { font-family: var(--ff); font-size: 20px; font-weight: 700; color: var(--green-dark); margin-bottom: 10px; }
        .mcard p  { font-size: 14px; color: var(--tl); line-height: 1.72; }

        /* ── Stats row ── */
        .stats-row { padding: 80px 0; background: linear-gradient(135deg,var(--green) 0%,var(--green-dark) 100%); }
        .sgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; text-align: center; }
        .si .big { font-family: var(--ff); font-size: clamp(38px,5vw,54px); font-weight: 800; color: var(--gold-light); line-height: 1; margin-bottom: 8px; }
        .si .lbl { font-size: 14px; color: rgba(255,255,255,.62); }

        /* ── Page hero override for about page ── */
        .page-hero { background-color: var(--green-dark); }

        /* ── Responsive ── */
        @media(max-width:900px) {
          .founder-inner { grid-template-columns: 1fr; gap: 48px; }
          .why-item, .why-item.reverse { grid-template-columns: 1fr; gap: 32px; direction: ltr; }
          .mgrid { grid-template-columns: 1fr 1fr; }
          .sgrid { grid-template-columns: repeat(2,1fr); }
        }
        @media(max-width:540px) {
          .mgrid { grid-template-columns: 1fr; }
          .founder, .why, .mission { padding: 64px 0; }
        }
      `}</style>

      <LandingNav />

      {/* ── Page Hero ── */}
      <section className="page-hero" style={{backgroundImage:"url('/images/about/about-hero.jpg')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/about/about-hero.jpg')"}}></div>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>About Us</span>
          </div>
          <div className="sl center wh">Our Story</div>
          <h1>Born from <span>Purpose</span>,<br/>Built on Faith</h1>
          <p>Learn how a Hafiz-e-Quran with a vision set out to make authentic Quranic education accessible to every Muslim on earth.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      {/* ── Founder Story ── */}
      <section className="founder">
        <div className="container">
          <div className="founder-inner">
            {/* Portrait image */}
            <div className="founder-imgw">
              <div className="founder-main">
                {/* LOCAL: public/images/founder/founder.jpg — 4:5 portrait */}
                <img
                  src="/images/founder/founder.jpg"
                  alt="Hafiz Awais — Founder of QuranMentorGlobal"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
              <div className="founder-badge">
                <div className="num">Hafiz</div>
                <div className="lbl">e-Quran · ACCA</div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="sl">The Founder</div>
              <h2 className="st">Meet <span>Hafiz Awais</span></h2>
              <p className="ss">Hafiz Awais completed his Hifz at a young age and went on to pursue professional studies in accounting (ACCA). But the love for Quran education never left him — it grew into a calling.</p>
              <p className="ss" style={{marginTop:16,marginBottom:28}}>He noticed a recurring problem: Muslim families in the West, Gulf, and even Pakistan struggling to find qualified, trustworthy Quran teachers for their children. The solution became Quran Mentor Global.</p>
              <div className="founder-creds">
                {[
                  { ico:'📖', title:'Hafiz-e-Quran', desc:'Memorized the complete Quran at a young age with full Tajweed under certified Qaris' },
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

      {/* ── Why We Built This — alternating visual storytelling ── */}
      <section className="why">
        <div className="container">
          <div className="section-hd">
            <div className="sl center">Why We Built This</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Three Problems.<br/><span>One Solution.</span></h2>
            <p className="ss" style={{margin:'0 auto 64px',textAlign:'center'}}>We built Quran Mentor Global to solve real challenges facing Muslim families worldwide.</p>
          </div>

          {/* Row 1 */}
          <div className="why-item">
            <div className="why-img">
              {/* LOCAL: public/images/about/mission.jpg — 4:3 */}
              <img src="/images/about/mission.jpg" alt="Accessible Quran education" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div>
              <div className="why-tag">🕌 Accessibility</div>
              <h3 className="st">Quality Education Was<br/><span>Hard to Find</span></h3>
              <p className="ss" style={{marginBottom:20}}>Millions of Muslims worldwide — especially in the West — struggle to find qualified, local Quran teachers. Long waitlists, high costs, and geographic barriers kept families from proper Quranic education.</p>
              <p style={{fontSize:14,color:'var(--tl)',lineHeight:1.7}}>We removed every barrier. On Quran Mentor Global, a student in London gets the same quality teacher as someone in Lahore — from their own home, at a time that suits them.</p>
            </div>
          </div>

          {/* Row 2 — reversed */}
          <div className="why-item reverse">
            <div className="why-img">
              {/* LOCAL: public/images/about/vision.jpg — 4:3 */}
              <img src="/images/about/vision.jpg" alt="Trust and verification" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div>
              <div className="why-tag">✅ Trust & Quality</div>
              <h3 className="st">Finding a <span>Trustworthy</span><br/>Teacher Was Risky</h3>
              <p className="ss" style={{marginBottom:20}}>Online platforms offered no verification. Parents had no way to know if a teacher was truly qualified, safe, or experienced — especially for their children.</p>
              <p style={{fontSize:14,color:'var(--tl)',lineHeight:1.7}}>Every teacher on our platform holds verified Ijazah certification, passes a background check, and builds a reputation through transparent student reviews before they can teach.</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="why-item">
            <div className="why-img">
              {/* LOCAL: public/images/about/global-impact.jpg — 4:3 */}
              <img src="/images/about/global-impact.jpg" alt="Global Muslim community" loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
            <div>
              <div className="why-tag">🌍 Global Impact</div>
              <h3 className="st">The Ummah Needed<br/><span>One Platform</span></h3>
              <p className="ss" style={{marginBottom:20}}>Muslim communities across 100+ countries share the same goal — connecting with the Quran. Yet there was no single trusted home for this.</p>
              <p style={{fontSize:14,color:'var(--tl)',lineHeight:1.7}}>Quran Mentor Global is building that home. One Ummah, one mission, one platform — uniting learners from Pakistan to London to Houston to Dubai around the words of Allah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission Cards ── */}
      <section className="mission">
        <div className="container">
          <div className="section-hd">
            <div className="sl center">Our Mission</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Three Principles That <span>Guide Us</span></h2>
            <p className="ss" style={{margin:'0 auto 64px',textAlign:'center'}}>Everything we build, every decision we make, is grounded in these beliefs.</p>
          </div>
          <div className="mgrid">
            {[
              { ico:'🕌', title:'Accessibility First',    desc:'Every Muslim — regardless of location, age, or background — deserves access to quality Quranic education. We remove every barrier between a student and their teacher.' },
              { ico:'✅', title:'Quality & Trust',        desc:'We verify every teacher before they teach. Ijazah certification, background checks, and student reviews ensure you always get the best — not just the available.' },
              { ico:'🌍', title:'Global Community',       desc:'We are building a worldwide community of learners united by the Quran — from Pakistan to London to Houston to Dubai. One Ummah, one shared mission.' },
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

      {/* ── Stats ── */}
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

      {/* ── Hadith ── */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src">— Sahih Al-Bukhari</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={{padding:'100px 0',background:'var(--cream)'}}>
        <div className="container" style={{textAlign:'center'}}>
          <div className="sl center">Join Us</div>
          <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Begin Your <span>Quranic Journey</span></h2>
          <p className="ss" style={{margin:'0 auto 32px',textAlign:'center'}}>Join thousands of students worldwide who have found their perfect Quran teacher through our platform.</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/signup"       className="btn btn-gold">Sign Up Free ✦</Link>
            <Link href="/platform/teachers" className="btn btn-outline-green">Browse Teachers →</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
