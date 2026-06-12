'use client'
import { useState } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const TEACHERS = [
  { spec:'tajweed hifz', img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', name:'Qari Abdullah', title:'Tajweed & Hifz Specialist', origin:'🇵🇰 Pakistan', exp:'12 yrs exp', stars:'★★★★★ 4.9', reviews:'142 reviews', langs:'English · Urdu', tags:['Hafs','Adults','English'] },
  { spec:'tafseer tajweed', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', name:'Sheikh Ibrahim', title:'Tafseer & Advanced Quran', origin:'🇸🇦 Saudi Arabia', exp:'15 yrs exp', stars:'★★★★★ 4.8', reviews:'98 reviews', langs:'Arabic · English', tags:['Tafseer','Advanced'] },
  { spec:'qaida kids', img:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', name:'Qari Yusuf', title:'Noorani Qaida · Kids Specialist', origin:'🇵🇰 Pakistan', exp:'8 yrs exp', stars:'★★★★★ 5.0', reviews:'207 reviews', langs:'English · Urdu', tags:['Kids','Beginners'] },
  { spec:'hifz', img:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', name:'Ustadh Bilal', title:'Hifz · Memorization', origin:'🇪🇬 Egypt', exp:'10 yrs exp', stars:'★★★★★ 4.9', reviews:'175 reviews', langs:'Arabic · English', tags:['Hifz','Ijazah'] },
  { spec:'tajweed kids', img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', name:'Qari Hassan', title:'Tajweed for All Ages', origin:'🇬🇧 United Kingdom', exp:'6 yrs exp', stars:'★★★★★ 4.7', reviews:'83 reviews', langs:'English · Urdu', tags:['Tajweed','Kids'] },
  { spec:'tafseer hifz', img:'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80', name:'Sheikh Tariq', title:'Tafseer & Hifz Programme', origin:'🇸🇦 Saudi Arabia', exp:'20 yrs exp', stars:'★★★★★ 4.9', reviews:'321 reviews', langs:'Arabic · Urdu', tags:['Scholar','Advanced'] },
]

export default function TeachersLandingPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? TEACHERS : TEACHERS.filter(t => t.spec.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        .filter-bar{background:var(--cream);border-bottom:1px solid var(--cream-d);padding:18px 0}
        .filter-bar .container{display:flex;gap:10px;flex-wrap:wrap}
        .ftab{padding:8px 20px;border-radius:50px;border:1.5px solid var(--cream-d);background:#fff;font-size:13px;font-weight:600;color:var(--tm);cursor:pointer;transition:all .25s;font-family:var(--fb)}
        .ftab.active,.ftab:hover{background:var(--green);color:#fff;border-color:var(--green)}
        .teachers-main{padding:80px 0;background:#fff}
        .tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
        .tc{background:#fff;border:1px solid var(--cream-d);border-radius:20px;overflow:hidden;transition:all .4s;box-shadow:0 4px 20px rgba(0,0,0,.06)}
        .tc:hover{box-shadow:0 20px 50px rgba(0,0,0,.12);transform:translateY(-6px);border-color:var(--gold-pale)}
        .tc-img{height:220px;overflow:hidden;position:relative}
        .tc-img img{width:100%;height:100%;object-fit:cover;object-position:top;transition:transform .5s}
        .tc:hover .tc-img img{transform:scale(1.06)}
        .tc-badge{position:absolute;top:12px;right:12px;background:var(--green);color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px}
        .tc-body{padding:20px}
        .tc-name{font-family:var(--ff);font-size:18px;font-weight:700;color:var(--green-dark);margin-bottom:3px}
        .tc-spec{font-size:12px;color:var(--gold);font-weight:600;margin-bottom:4px}
        .tc-origin{font-size:12px;color:var(--tl);margin-bottom:6px}
        .tc-stars{color:var(--gold);font-size:13px;margin-bottom:8px}
        .tc-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
        .tc-tag{font-size:11px;background:var(--cream);color:var(--tm);padding:3px 10px;border-radius:20px;font-weight:500}
        .tc-foot{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--cream-d)}
        .tc-lang{font-size:12px;color:var(--tl)}
        .tc-btn{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--green);transition:gap .2s}
        .tc:hover .tc-btn{gap:9px}
        .hero-badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px}
        .hero-badge{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.9);font-size:13px;font-weight:500;padding:7px 18px;border-radius:50px}
        @media(max-width:900px){.tgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:540px){.tgrid{grid-template-columns:1fr}}
      `}</style>

      <LandingNav />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Our Teachers</span></div>
          <div className="sl center wh">500+ Certified Qaris</div>
          <h1>Learn from the <span>Best</span><br/>Quran Teachers</h1>
          <p>Every teacher is thoroughly verified — Ijazah-certified, background-checked, and rated by real students before joining our platform.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
          <div className="hero-badges">
            {['✅ Verified Ijazah','🔒 Background Checked','⭐ Student Rated','🌍 Multiple Languages'].map((b, i) => (
              <div className="hero-badge" key={i}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="container">
          {[
            { val:'all', label:'All Teachers' },
            { val:'tajweed', label:'Tajweed' },
            { val:'hifz', label:'Hifz' },
            { val:'kids', label:'Kids Specialist' },
            { val:'tafseer', label:'Tafseer' },
            { val:'qaida', label:'Noorani Qaida' },
          ].map(f => (
            <button key={f.val} className={`ftab${filter === f.val ? ' active' : ''}`} onClick={() => setFilter(f.val)}>{f.label}</button>
          ))}
        </div>
      </div>

      <section className="teachers-main">
        <div className="container">
          <div className="tgrid">
            {filtered.map((t, i) => (
              <div className="tc" key={i}>
                <div className="tc-img">
                  <img src={t.img} alt={t.name} loading="lazy" />
                  <span className="tc-badge">Ijazah ✓</span>
                </div>
                <div className="tc-body">
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-spec">{t.title}</div>
                  <div className="tc-origin">{t.origin} · {t.exp}</div>
                  <div className="tc-stars">{t.stars} ({t.reviews})</div>
                  <div className="tc-tags">{t.tags.map((tag, j) => <span className="tc-tag" key={j}>{tag}</span>)}</div>
                  <div className="tc-foot">
                    <span className="tc-lang">🗣 {t.langs}</span>
                    <Link href="/platform/teachers" className="tc-btn">Book Trial →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:60}}>
            <p style={{fontSize:14,color:'var(--tl)',marginBottom:20}}>These are sample profiles. Browse all real verified teachers on the platform.</p>
            <Link href="/platform/teachers" className="btn btn-gold">Browse All Teachers on Platform ✦</Link>
          </div>
        </div>
      </section>

      <div className="hadith">
        <div className="container">
          <p className="hadith-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src">— Sahih Al-Bukhari</p>
        </div>
      </div>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
