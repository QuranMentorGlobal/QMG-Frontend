'use client'
import { useState } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const COURSES = [
  { cat:'beginner', ico:'🔤', img:'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80', lvlCls:'lv-b', lvl:'Beginner', title:'Noorani Qaida', desc:'Master Arabic letters and basic Quran pronunciation from scratch — the essential first step for every new learner.', feats:['Arabic letter recognition','Harkat & vowel sounds','Joining letters & words'], dur:'3–6 months', age:'All Ages' },
  { cat:'beginner kids', ico:'👧', img:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80', lvlCls:'lv-b', lvl:'Beginner', title:'Kids Quran Programme', desc:'Fun, engaging and structured Quran learning designed for children ages 4–10. Patient teachers who specialize in young learners.', feats:['Interactive & fun methods','Phonics-based Arabic','Parent progress reports'], dur:'Ongoing', age:'Ages 4–10' },
  { cat:'intermediate', ico:'🎵', img:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600&q=80', lvlCls:'lv-i', lvl:'Intermediate', title:'Tajweed Rules', desc:'Perfect your recitation with the rules of Tajweed — recite the Quran exactly the way it was revealed to the Prophet ﷺ.', feats:['Makharij al-Huruf','Rules of Noon & Meem','Waqf & Ibtida'], dur:'6–12 months', age:'8+ Years' },
  { cat:'advanced', ico:'📖', img:'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=600&q=80', lvlCls:'lv-a', lvl:'Advanced', title:'Hifz (Memorization)', desc:'Memorize the Quran with a dedicated Hafiz mentor — structured programme with daily revision targets and tracking.', feats:['Structured daily targets','Revision system','Ijazah pathway'], dur:'2–4 years', age:'7+ Years' },
  { cat:'advanced', ico:'🌙', img:'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80', lvlCls:'lv-s', lvl:'Scholarly', title:'Tafseer & Translation', desc:'Understand the deeper meaning and context of Quranic verses — deepen your connection with Allah\'s words.', feats:['Verse by verse analysis','Historical context','Arabic comprehension'], dur:'12+ months', age:'Adults' },
  { cat:'intermediate advanced', ico:'🏅', img:'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&q=80', lvlCls:'lv-a', lvl:'Advanced', title:'Ijazah Programme', desc:'Earn a formal Ijazah certification in Quranic recitation — an unbroken chain of transmission from teacher to student.', feats:['One-on-one intensive','Full chain of Sanad','Formal certification'], dur:'1–2 years', age:'Adults' },
]

export default function CoursesPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.cat.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        .filter-tabs{background:var(--cream);border-bottom:1px solid var(--cream-d);padding:20px 0}
        .filter-tabs .container{display:flex;gap:10px;flex-wrap:wrap}
        .tab{padding:9px 22px;border-radius:50px;border:1.5px solid var(--cream-d);background:#fff;font-size:13px;font-weight:600;color:var(--tm);cursor:pointer;transition:all .25s;font-family:var(--fb)}
        .tab.active,.tab:hover{background:var(--green);color:#fff;border-color:var(--green)}
        .courses-sec{padding:80px 0;background:#fff}
        .cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
        .cc{border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.09);transition:all .4s;border:1px solid var(--cream-d)}
        .cc:hover{box-shadow:0 24px 60px rgba(0,0,0,.14);transform:translateY(-8px)}
        .cc-img{height:180px;overflow:hidden;position:relative}
        .cc-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
        .cc:hover .cc-img img{transform:scale(1.08)}
        .cc-lvl{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;padding:4px 11px;border-radius:20px;letter-spacing:.08em;text-transform:uppercase}
        .lv-b{background:rgba(74,222,128,.85);color:#064e3b}.lv-i{background:rgba(251,191,36,.85);color:#451a03}
        .lv-a{background:rgba(167,139,250,.85);color:#2e1065}.lv-s{background:rgba(13,61,32,.88);color:var(--gold-light)}
        .cc-body{padding:24px}
        .cc-ico{font-size:28px;margin-bottom:10px}
        .cc h3{font-family:var(--ff);font-size:19px;font-weight:700;color:var(--green-dark);margin-bottom:8px}
        .cc p{font-size:14px;color:var(--tl);line-height:1.68;margin-bottom:14px}
        .cc-feats{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
        .cc-feat{font-size:13px;color:var(--tm);display:flex;align-items:center;gap:7px}
        .cc-feat::before{content:'✓';color:var(--green);font-weight:700;font-size:12px}
        .cc-foot{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid var(--cream-d)}
        .cc-dur{font-size:12px;color:var(--tl)}
        .cc-enroll{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:700;color:var(--green);transition:gap .2s}
        .cc:hover .cc-enroll{gap:9px}
        @media(max-width:900px){.cgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:540px){.cgrid{grid-template-columns:1fr}}
      `}</style>

      <LandingNav />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Courses</span></div>
          <div className="sl center wh">Our Programmes</div>
          <h1>Find Your <span>Perfect</span><br/>Quran Course</h1>
          <p>From absolute beginners to advanced Hifz students — we have a course designed exactly for your level, age, and goals.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      <div className="filter-tabs">
        <div className="container">
          {[
            { val:'all', label:'All Courses' },
            { val:'beginner', label:'Beginner' },
            { val:'intermediate', label:'Intermediate' },
            { val:'advanced', label:'Advanced' },
            { val:'kids', label:'For Kids' },
          ].map(t => (
            <button key={t.val} className={`tab${filter === t.val ? ' active' : ''}`} onClick={() => setFilter(t.val)}>{t.label}</button>
          ))}
        </div>
      </div>

      <section className="courses-sec">
        <div className="container">
          <div className="cgrid">
            {filtered.map((c, i) => (
              <div className="cc" key={i}>
                <div className="cc-img">
                  <img src={c.img} alt={c.title} loading="lazy" />
                  <span className={`cc-lvl ${c.lvlCls}`}>{c.lvl}</span>
                </div>
                <div className="cc-body">
                  <div className="cc-ico">{c.ico}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <div className="cc-feats">{c.feats.map((f, j) => <div className="cc-feat" key={j}>{f}</div>)}</div>
                  <div className="cc-foot">
                    <span className="cc-dur">⏱ {c.dur} · {c.age}</span>
                    <Link href="/platform/teachers" className="cc-enroll">Enroll →</Link>
                  </div>
                </div>
              </div>
            ))}
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

      <section style={{padding:'80px 0',background:'var(--cream)',textAlign:'center'}}>
        <div className="container">
          <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Ready to <span>Start Learning?</span></h2>
          <p className="ss" style={{margin:'0 auto 32px',textAlign:'center'}}>Browse our verified teachers and book your first free trial lesson today.</p>
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
