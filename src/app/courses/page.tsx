'use client'
import { useState } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const COURSES = [
  {
    cat: 'beginner',
    ico: '🔤',
    img: '/images/courses-cards/noorani-qaida.png',
    lvlCls: 'lv-b', lvl: 'Beginner',
    title: 'Noorani Qaida',
    desc: 'Master Arabic letters and basic Quran pronunciation from scratch — the essential first step for every new learner.',
    feats: ['Arabic letter recognition', 'Harkat & vowel sounds', 'Joining letters & words'],
    dur: '3–6 months', age: 'All Ages',
  },
  {
    cat: 'beginner kids',
    ico: '👧',
    img: '/images/courses-cards/kids-quran.png',
    lvlCls: 'lv-b', lvl: 'Beginner',
    title: 'Kids Quran Programme',
    desc: 'Fun, engaging and structured Quran learning designed for children ages 4–10. Patient teachers who specialize in young learners.',
    feats: ['Interactive & fun methods', 'Phonics-based Arabic', 'Parent progress reports'],
    dur: 'Ongoing', age: 'Ages 4–10',
  },
  {
    cat: 'intermediate',
    ico: '🎵',
    img: '/images/courses-cards/tajweed.png',
    lvlCls: 'lv-i', lvl: 'Intermediate',
    title: 'Tajweed Rules',
    desc: 'Perfect your recitation with the rules of Tajweed — recite the Quran exactly the way it was revealed to the Prophet ﷺ.',
    feats: ['Makharij al-Huruf', 'Rules of Noon & Meem', 'Waqf & Ibtida'],
    dur: '6–12 months', age: '8+ Years',
  },
  {
    cat: 'advanced',
    ico: '📖',
    img: '/images/courses-cards/hifz.png',
    lvlCls: 'lv-a', lvl: 'Advanced',
    title: 'Hifz (Memorization)',
    desc: 'Memorize the Quran with a dedicated Hafiz mentor — structured programme with daily revision targets and tracking.',
    feats: ['Structured daily targets', 'Revision system', 'Ijazah pathway'],
    dur: '2–4 years', age: '7+ Years',
  },
  {
    cat: 'advanced',
    ico: '🌙',
    img: '/images/courses-cards/tafseer.png',
    lvlCls: 'lv-s', lvl: 'Scholarly',
    title: 'Tafseer & Translation',
    desc: 'Understand the deeper meaning and context of Quranic verses — deepen your connection with Allah\'s words.',
    feats: ['Verse by verse analysis', 'Historical context', 'Arabic comprehension'],
    dur: '12+ months', age: 'Adults',
  },
  {
    cat: 'intermediate advanced',
    ico: '🏅',
    img: '/images/courses-cards/ijazah.png',
    lvlCls: 'lv-a', lvl: 'Advanced',
    title: 'Ijazah Programme',
    desc: 'Earn a formal Ijazah certification in Quranic recitation — an unbroken chain of transmission from teacher to student.',
    feats: ['One-on-one intensive', 'Full chain of Sanad', 'Formal certification'],
    dur: '1–2 years', age: 'Adults',
  },
]

const FILTERS = [
  { val: 'all',          label: 'All Courses'  },
  { val: 'beginner',    label: 'Beginner'      },
  { val: 'intermediate',label: 'Intermediate'  },
  { val: 'advanced',    label: 'Advanced'      },
  { val: 'kids',        label: 'For Kids'      },
]

export default function CoursesPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.cat.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        /* ── Filter tabs ── */
        .filter-tabs { background: var(--cream); border-bottom: 1px solid var(--cream-d); padding: 20px 0; }
        .filter-tabs .container { display: flex; gap: 10px; flex-wrap: wrap; }
        .tab { padding: 9px 22px; border-radius: 50px; border: 1.5px solid var(--cream-d); background: #fff; font-size: 13px; font-weight: 600; color: var(--tm); cursor: pointer; transition: all .25s; font-family: var(--fb); }
        .tab.active, .tab:hover { background: var(--green); color: #fff; border-color: var(--green); }

        /* ── Course grid ── */
        .courses-sec { padding: 80px 0; background: #fff; }
        .cgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
        .cc { border-radius: 20px; overflow: hidden; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.09); transition: all .4s var(--ease); border: 1px solid var(--cream-d); }
        .cc:hover { box-shadow: 0 24px 60px rgba(0,0,0,.14); transform: translateY(-8px); border-color: var(--gold-pale); }

        /* 4:3 course card images */
        .cc-img { position: relative; width: 100%; aspect-ratio: 4/3; overflow: hidden; background: var(--cream-d); }
        .cc-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .5s; display: block; }
        .cc:hover .cc-img img { transform: scale(1.07); }

        .cc-lvl { position: absolute; top: 10px; left: 10px; font-size: 10px; font-weight: 700; padding: 4px 11px; border-radius: 20px; letter-spacing: .08em; text-transform: uppercase; }
        .lv-b { background: rgba(74,222,128,.85); color: #064e3b; }
        .lv-i { background: rgba(251,191,36,.85); color: #451a03; }
        .lv-a { background: rgba(167,139,250,.85); color: #2e1065; }
        .lv-s { background: rgba(13,61,32,.88); color: var(--gold-light); }

        .cc-body { padding: 26px; }
        .cc-ico  { font-size: 28px; margin-bottom: 10px; }
        .cc h3   { font-family: var(--ff); font-size: 19px; font-weight: 700; color: var(--green-dark); margin-bottom: 8px; }
        .cc p    { font-size: 14px; color: var(--tl); line-height: 1.68; margin-bottom: 14px; }
        .cc-feats { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .cc-feat  { font-size: 13px; color: var(--tm); display: flex; align-items: center; gap: 7px; }
        .cc-feat::before { content: '✓'; color: var(--green); font-weight: 700; font-size: 12px; }
        .cc-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--cream-d); }
        .cc-dur  { font-size: 12px; color: var(--tl); }
        .cc-enroll { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: var(--green); transition: gap .2s; }
        .cc:hover .cc-enroll { gap: 9px; }

        /* ── Trust strip ── */
        .trust-strip { background: var(--green-dark); padding: 40px 0; }
        .tstrip-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; text-align: center; }
        .tstrip-item .big  { font-family: var(--ff); font-size: 32px; font-weight: 800; color: var(--gold-light); line-height: 1; margin-bottom: 6px; }
        .tstrip-item .lbl  { font-size: 13px; color: rgba(255,255,255,.55); }

        /* ── Page hero ── */
        .page-hero { background-color: var(--green-dark); }

        @media(max-width:900px) { .cgrid { grid-template-columns: repeat(2,1fr); } .tstrip-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:540px) { .cgrid { grid-template-columns: 1fr; } .courses-sec { padding: 56px 0; } }
      `}</style>

      <LandingNav />

      {/* ── Page Hero ── */}
      <section className="page-hero" style={{backgroundImage:"url('/images/courses/courses-hero.png')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/courses/courses-hero.png')"}}></div>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>Courses</span>
          </div>
          <div className="sl center wh">Our Programmes</div>
          <h1>Find Your <span>Perfect</span><br/>Quran Course</h1>
          <p>From absolute beginners to advanced Hifz students — we have a course designed exactly for your level, age, and goals.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="trust-strip">
        <div className="container">
          <div className="tstrip-grid">
            {[
              { big: '6',    lbl: 'Courses Available'    },
              { big: '500+', lbl: 'Certified Teachers'   },
              { big: 'Free', lbl: 'First Trial Lesson'   },
              { big: '4.9★', lbl: 'Average Course Rating' },
            ].map((s, i) => (
              <div className="tstrip-item" key={i}>
                <div className="big">{s.big}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="filter-tabs">
        <div className="container">
          {FILTERS.map(t => (
            <button
              key={t.val}
              className={`tab${filter === t.val ? ' active' : ''}`}
              onClick={() => setFilter(t.val)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Course grid ── */}
      <section className="courses-sec">
        <div className="container">
          <div className="cgrid">
            {filtered.map((c, i) => (
              <div className="cc" key={i}>
                <div className="cc-img">
                  {/* LOCAL: /images/courses-cards/[slug].png — 4:3 ratio */}
                  <img src={c.img} alt={c.title} loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className={`cc-lvl ${c.lvlCls}`}>{c.lvl}</span>
                </div>
                <div className="cc-body">
                  <div className="cc-ico">{c.ico}</div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <div className="cc-feats">
                    {c.feats.map((f, j) => <div className="cc-feat" key={j}>{f}</div>)}
                  </div>
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

      {/* ── Hadith ── */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src">— Sahih Al-Bukhari</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={{padding:'80px 0',background:'var(--cream)',textAlign:'center'}}>
        <div className="container">
          <div className="sl center">Get Started</div>
          <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Ready to <span>Start Learning?</span></h2>
          <p className="ss" style={{margin:'0 auto 32px',textAlign:'center'}}>Browse our verified teachers and book your first free trial lesson today — no credit card needed.</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/signup"       className="btn btn-gold">Book Free Trial ✦</Link>
            <Link href="/platform/teachers" className="btn btn-outline-green">Browse Teachers →</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
