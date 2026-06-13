'use client'
import { useState } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const TEACHERS = [
  {
    spec: 'tajweed hifz',
    img: '/images/teachers/teacher-1.jpg',
    name: 'Qari Abdullah',
    title: 'Tajweed & Hifz Specialist',
    origin: 'Pakistan', flag: '🇵🇰',
    exp: '12 yrs exp',
    rating: '4.9', reviews: '142',
    langs: ['English', 'Urdu'],
    tags: ['Hafs', 'Adults', 'Tajweed'],
    rate: '$12/hr',
  },
  {
    spec: 'tafseer tajweed',
    img: '/images/teachers/teacher-2.jpg',
    name: 'Sheikh Ibrahim',
    title: 'Tafseer & Advanced Quran',
    origin: 'Saudi Arabia', flag: '🇸🇦',
    exp: '15 yrs exp',
    rating: '4.8', reviews: '98',
    langs: ['Arabic', 'English'],
    tags: ['Tafseer', 'Advanced'],
    rate: '$15/hr',
  },
  {
    spec: 'qaida kids',
    img: '/images/teachers/teacher-3.jpg',
    name: 'Qari Yusuf',
    title: 'Noorani Qaida · Kids Specialist',
    origin: 'Pakistan', flag: '🇵🇰',
    exp: '8 yrs exp',
    rating: '5.0', reviews: '207',
    langs: ['English', 'Urdu'],
    tags: ['Kids', 'Beginners'],
    rate: '$10/hr',
  },
  {
    spec: 'hifz',
    img: '/images/teachers/teacher-4.jpg',
    name: 'Ustadh Bilal',
    title: 'Hifz · Memorization',
    origin: 'Egypt', flag: '🇪🇬',
    exp: '10 yrs exp',
    rating: '4.9', reviews: '175',
    langs: ['Arabic', 'English'],
    tags: ['Hifz', 'Ijazah'],
    rate: '$14/hr',
  },
  {
    spec: 'tajweed kids',
    img: '/images/teachers/teacher-5.jpg',
    name: 'Qari Hassan',
    title: 'Tajweed for All Ages',
    origin: 'United Kingdom', flag: '🇬🇧',
    exp: '6 yrs exp',
    rating: '4.7', reviews: '83',
    langs: ['English', 'Urdu'],
    tags: ['Tajweed', 'Kids'],
    rate: '$11/hr',
  },
  {
    spec: 'tafseer hifz',
    img: '/images/teachers/teacher-6.jpg',
    name: 'Sheikh Tariq',
    title: 'Tafseer & Hifz Programme',
    origin: 'Saudi Arabia', flag: '🇸🇦',
    exp: '20 yrs exp',
    rating: '4.9', reviews: '321',
    langs: ['Arabic', 'Urdu'],
    tags: ['Scholar', 'Advanced'],
    rate: '$18/hr',
  },
]

const FILTERS = [
  { val: 'all',      label: 'All Teachers'       },
  { val: 'tajweed',  label: 'Tajweed'            },
  { val: 'hifz',     label: 'Hifz'               },
  { val: 'kids',     label: 'Kids Specialist'    },
  { val: 'tafseer',  label: 'Tafseer'            },
  { val: 'qaida',    label: 'Noorani Qaida'      },
]

function StarRating({ rating }: { rating: string }) {
  const r = parseFloat(rating)
  return (
    <div style={{display:'flex',alignItems:'center',gap:4}}>
      <span style={{color:'var(--gold)',fontSize:12}}>
        {'★'.repeat(Math.floor(r))}{'☆'.repeat(5 - Math.floor(r))}
      </span>
      <span style={{fontSize:12,fontWeight:700,color:'var(--green-dark)'}}>{rating}</span>
    </div>
  )
}

export default function TeachersLandingPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? TEACHERS : TEACHERS.filter(t => t.spec.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        /* ── Filter bar ── */
        .filter-bar { background: var(--cream); border-bottom: 1px solid var(--cream-d); padding: 18px 0; }
        .filter-bar .container { display: flex; gap: 10px; flex-wrap: wrap; }
        .ftab { padding: 8px 20px; border-radius: 50px; border: 1.5px solid var(--cream-d); background: #fff; font-size: 13px; font-weight: 600; color: var(--tm); cursor: pointer; transition: all .25s; font-family: var(--fb); }
        .ftab.active, .ftab:hover { background: var(--green); color: #fff; border-color: var(--green); }

        /* ── Teacher grid ── */
        .teachers-main { padding: 80px 0; background: #fff; }
        .tgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
        .tc { background: #fff; border: 1px solid var(--cream-d); border-radius: 20px; overflow: hidden; transition: all .4s var(--ease); box-shadow: 0 4px 20px rgba(0,0,0,.06); }
        .tc:hover { box-shadow: 0 20px 50px rgba(0,0,0,.12); transform: translateY(-6px); border-color: var(--gold-pale); }

        /* 1:1 teacher images */
        .tc-img { position: relative; width: 100%; aspect-ratio: 1/1; overflow: hidden; background: var(--cream-d); }
        .tc-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform .5s; display: block; }
        .tc:hover .tc-img img { transform: scale(1.05); }

        /* Verification badge overlay */
        .tc-verified { position: absolute; top: 12px; right: 12px; background: var(--green); color: #fff; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
        .tc-flag { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); }

        .tc-body { padding: 20px; }
        .tc-name { font-family: var(--ff); font-size: 18px; font-weight: 700; color: var(--green-dark); margin-bottom: 3px; }
        .tc-spec { font-size: 12px; color: var(--gold); font-weight: 600; margin-bottom: 6px; }
        .tc-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .tc-exp  { font-size: 12px; color: var(--tl); }
        .tc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .tc-tag  { font-size: 11px; background: var(--cream); color: var(--tm); padding: 3px 10px; border-radius: 20px; font-weight: 500; }
        .tc-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--cream-d); }
        .tc-lang { font-size: 12px; color: var(--tl); }
        .tc-rate { font-size: 13px; font-weight: 700; color: var(--green-dark); }
        .tc-btn  { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: #fff; background: var(--green); padding: 7px 16px; border-radius: 50px; transition: all .2s; }
        .tc-btn:hover { background: var(--green-mid); transform: translateY(-2px); }

        /* ── Verification process section ── */
        .verify-sec { padding: 80px 0; background: var(--cream); }
        .vgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        .vcard { background: #fff; border-radius: 16px; padding: 28px 20px; text-align: center; border: 1px solid var(--cream-d); }
        .vcard-num { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg,var(--green),var(--green-mid)); color: #fff; font-family: var(--ff); font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .vcard h4 { font-family: var(--ff); font-size: 16px; font-weight: 700; color: var(--green-dark); margin-bottom: 8px; }
        .vcard p  { font-size: 13px; color: var(--tl); line-height: 1.6; }

        /* ── Hero badges ── */
        .hero-badges { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
        .hero-badge  { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.9); font-size: 13px; font-weight: 500; padding: 7px 16px; border-radius: 50px; }

        /* ── Page hero ── */
        .page-hero { background-color: var(--green-dark); }

        @media(max-width:900px) { .tgrid { grid-template-columns: repeat(2,1fr); } .vgrid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:540px) { .tgrid { grid-template-columns: 1fr; } .vgrid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <LandingNav />

      {/* ── Page Hero ── */}
      <section className="page-hero" style={{backgroundImage:"url('/images/teachers/teachers-hero.jpg')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/teachers/teachers-hero.jpg')"}}></div>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>Our Teachers</span>
          </div>
          <div className="sl center wh">500+ Certified Qaris</div>
          <h1>Learn from the <span>Best</span><br/>Quran Teachers</h1>
          <p>Every teacher is thoroughly verified — Ijazah-certified, background-checked, and rated by real students before joining our platform.</p>
          <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
          <div className="hero-badges">
            {['✅ Verified Ijazah', '🔒 Background Checked', '⭐ Student Rated', '🌍 Multiple Languages'].map((b, i) => (
              <div className="hero-badge" key={i}>{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="container">
          {FILTERS.map(f => (
            <button
              key={f.val}
              className={`ftab${filter === f.val ? ' active' : ''}`}
              onClick={() => setFilter(f.val)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Teacher cards ── */}
      <section className="teachers-main">
        <div className="container">
          <div className="tgrid">
            {filtered.map((t, i) => (
              <div className="tc" key={i}>
                {/* 1:1 teacher image */}
                <div className="tc-img">
                  <img src={t.img} alt={t.name} loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <span className="tc-verified">✓ Ijazah</span>
                  <span className="tc-flag">{t.flag} {t.origin}</span>
                </div>

                <div className="tc-body">
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-spec">{t.title}</div>

                  <div className="tc-meta">
                    <StarRating rating={t.rating} />
                    <span style={{fontSize:12,color:'var(--tl)'}}>({t.reviews} reviews)</span>
                  </div>

                  <div className="tc-tags">
                    {t.tags.map((tag, j) => <span className="tc-tag" key={j}>{tag}</span>)}
                  </div>

                  <div className="tc-foot">
                    <div>
                      <div className="tc-lang">🗣 {t.langs.join(' · ')}</div>
                      <div className="tc-exp" style={{marginTop:2}}>{t.exp}</div>
                    </div>
                    <Link href="/platform/teachers" className="tc-btn">Book Trial →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:56}}>
            <p style={{fontSize:14,color:'var(--tl)',marginBottom:20}}>
              Showing sample profiles. Browse all real verified teachers on the platform.
            </p>
            <Link href="/platform/teachers" className="btn btn-gold">Browse All Teachers on Platform ✦</Link>
          </div>
        </div>
      </section>

      {/* ── Verification Process ── */}
      <section className="verify-sec">
        <div className="container">
          <div className="section-hd">
            <div className="sl center">Our Standard</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>How We <span>Verify</span> Every Teacher</h2>
            <p className="ss" style={{margin:'0 auto 56px',textAlign:'center'}}>Our 4-step verification process ensures every teacher meets our strict quality and safety standards.</p>
          </div>
          <div className="vgrid">
            {[
              { n:'1', title:'Application Review',    desc:'Teacher submits credentials, Ijazah certificate, and teaching experience. Our team reviews every detail.' },
              { n:'2', title:'Identity Verification', desc:'Government-issued ID verified and background check conducted for the safety of all students.' },
              { n:'3', title:'Teaching Assessment',   desc:'Live teaching demonstration reviewed by our academic team. Tajweed and methodology evaluated.' },
              { n:'4', title:'Student Ratings',       desc:'Once live, teachers build reputation through verified student reviews. Quality is maintained through feedback.' },
            ].map((v, i) => (
              <div className="vcard" key={i}>
                <div className="vcard-num">{v.n}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
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

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
