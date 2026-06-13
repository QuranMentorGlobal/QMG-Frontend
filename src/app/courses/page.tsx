'use client'
import { useState, useEffect } from 'react'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const COURSES = [
  { cat:'beginner',             ico:'🔤', img:'/images/courses-cards/noorani-qaida.png', lvlCls:'lv-b', lvl:'Beginner',    title:'Noorani Qaida',         desc:'Master Arabic letters and basic Quran pronunciation from scratch.',          feats:['Arabic letter recognition','Harkat & vowel sounds','Joining letters & words'],        back:'The essential first step for every new learner. Ideal for complete beginners of all ages — from children to adults starting their Quranic journey.',                         dur:'3–6 months', age:'All Ages'  },
  { cat:'beginner kids',        ico:'👧', img:'/images/courses-cards/kids-quran.png',    lvlCls:'lv-b', lvl:'Beginner',    title:'Kids Quran Programme',  desc:'Fun, engaging Quran learning designed for children ages 4–10.',             feats:['Interactive & fun methods','Phonics-based Arabic','Parent progress reports'],          back:'Patient specialist teachers make learning fun with songs, games, and visual methods. Parents receive weekly progress reports after every lesson.',                          dur:'Ongoing',    age:'Ages 4–10' },
  { cat:'intermediate',         ico:'🎵', img:'/images/courses-cards/tajweed.png',       lvlCls:'lv-i', lvl:'Intermediate', title:'Tajweed Rules',         desc:'Perfect your recitation with the rules of Tajweed.',                        feats:['Makharij al-Huruf','Rules of Noon & Meem','Waqf & Ibtida'],                           back:'Recite the Quran exactly as it was revealed to the Prophet ﷺ. Learn the precise rules of pronunciation, elongation, and pausing.',                                         dur:'6–12 months', age:'8+ Years' },
  { cat:'advanced',             ico:'📖', img:'/images/courses-cards/hifz.png',          lvlCls:'lv-a', lvl:'Advanced',     title:'Hifz (Memorization)',   desc:'Memorize the Quran with a dedicated Hafiz mentor.',                         feats:['Structured daily targets','Smart revision system','Ijazah pathway'],                  back:'A structured, proven programme with daily revision targets, smart spaced repetition, and a dedicated Hafiz mentor tracking your every step.',                               dur:'2–4 years',  age:'7+ Years'  },
  { cat:'advanced',             ico:'🌙', img:'/images/courses-cards/tafseer.png',       lvlCls:'lv-s', lvl:'Scholarly',    title:'Tafseer & Translation', desc:"Understand the deeper meaning and context of Quranic verses.",              feats:['Verse by verse analysis','Historical context','Arabic comprehension'],                back:"Deepen your connection with Allah's words. Learn the meaning, historical context, and wisdom behind each verse with a qualified scholar.",                                  dur:'12+ months', age:'Adults'    },
  { cat:'intermediate advanced',ico:'🏅', img:'/images/courses-cards/ijazah.png',        lvlCls:'lv-a', lvl:'Advanced',     title:'Ijazah Programme',      desc:'Earn a formal Ijazah certification in Quranic recitation.',                 feats:['One-on-one intensive','Full chain of Sanad','Formal certification'],                  back:'Earn an Ijazah — an unbroken chain of transmission linking you back to the Prophet ﷺ. The highest credential in Quranic recitation.',                                      dur:'1–2 years',  age:'Adults'    },
]

export default function CoursesPage() {
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>('.reveal,.reveal-up')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    reveals.forEach(el => obs.observe(el))
    const stbtn = document.getElementById('stbtn')
    const onScroll = () => { if (stbtn) stbtn.style.opacity = window.scrollY > 400 ? '1' : '0' }
    window.addEventListener('scroll', onScroll)
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.cat.includes(filter))

  return (
    <>
      <style>{LANDING_CSS + `
        .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s var(--ease),transform .7s var(--ease)}.reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-up{opacity:0;transform:translateY(20px);transition:opacity .6s var(--ease),transform .6s var(--ease)}.reveal-up.visible{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}.d5{transition-delay:.40s}.d6{transition-delay:.48s}
        @media(prefers-reduced-motion:reduce){.reveal,.reveal-up{opacity:1!important;transform:none!important;transition:none!important}}

        .filter-tabs{background:var(--cream);border-bottom:1px solid var(--cream-d);padding:20px 0}
        .filter-tabs .container{display:flex;gap:10px;flex-wrap:wrap}
        .tab{padding:9px 22px;border-radius:50px;border:1.5px solid var(--cream-d);background:#fff;font-size:13px;font-weight:600;color:var(--tm);cursor:pointer;transition:all .25s;font-family:var(--fb)}
        .tab.active,.tab:hover{background:var(--green);color:#fff;border-color:var(--green)}

        .courses-sec{padding:80px 0;background:#fff}
        .cgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}

        /* Flip course cards */
        .cc{height:420px;border-radius:20px;perspective:1000px;cursor:pointer}
        .cc-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .cc:hover .cc-inner{transform:rotateY(180deg)}
        .cc-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);border:1px solid var(--cream-d);display:flex;flex-direction:column;transition:box-shadow .3s,border-color .3s}
        .cc:hover .cc-front{box-shadow:0 24px 60px rgba(0,0,0,.14);border-color:var(--gold-pale)}
        .cc-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;gap:12px}
        .cc-back-ico{font-size:40px;animation:floatMed 3.5s ease-in-out infinite}
        @keyframes floatMed{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .cc-back h4{font-family:var(--ff);font-size:20px;font-weight:700;color:#fff}
        .cc-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.72}
        .cc-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:50px;margin-top:4px;transition:transform .2s}
        .cc-back .fbtn:hover{transform:translateY(-2px)}
        .cc-back .cc-lvl-back{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.15);color:var(--gold-light);letter-spacing:.08em;text-transform:uppercase}

        .cc-img{position:relative;width:100%;height:180px;overflow:hidden;background:var(--cream-d);flex-shrink:0}
        .cc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s;display:block}
        .cc:hover .cc-img img{transform:scale(1.07)}
        .cc-lvl{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;padding:4px 11px;border-radius:20px;letter-spacing:.08em;text-transform:uppercase}
        .lv-b{background:rgba(74,222,128,.85);color:#064e3b}.lv-i{background:rgba(251,191,36,.85);color:#451a03}.lv-a{background:rgba(167,139,250,.85);color:#2e1065}.lv-s{background:rgba(13,61,32,.88);color:var(--gold-light)}
        .cc-body{padding:22px;flex:1;display:flex;flex-direction:column}
        .cc-ico{font-size:24px;margin-bottom:8px}
        .cc-front h3{font-family:var(--ff);font-size:17px;font-weight:700;color:var(--green-dark);margin-bottom:7px}
        .cc-front p{font-size:13px;color:var(--tl);line-height:1.6;flex:1}
        .cc-feats{display:flex;flex-direction:column;gap:5px;margin-top:10px}
        .cc-feat{font-size:12px;color:var(--tm);display:flex;align-items:center;gap:6px}
        .cc-feat::before{content:'✓';color:var(--green);font-weight:700;font-size:11px}
        .cc-hint{font-size:11px;color:var(--gold);font-weight:600;margin-top:10px;display:flex;align-items:center;gap:4px}

        /* Trust strip */
        .trust-strip{background:var(--green-dark);padding:40px 0}
        .tstrip-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center}
        .tstrip-item .big{font-family:var(--ff);font-size:32px;font-weight:800;color:var(--gold-light);line-height:1;margin-bottom:6px}
        .tstrip-item .lbl{font-size:13px;color:rgba(255,255,255,.55)}
        .tstrip-item{transition:transform .3s}.tstrip-item:hover{transform:translateY(-4px)}

        .page-hero{background-color:var(--green-dark)}
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
        #stbtn:hover{transform:translateY(-4px) scale(1.05)}

        @media(max-width:900px){.cgrid{grid-template-columns:repeat(2,1fr)}.tstrip-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){.cc{height:auto}.cc-inner{position:static;transform:none!important}.cc-back{display:none}.cc-front{position:static;transform:none}}
        @media(max-width:540px){.cgrid{grid-template-columns:1fr}.courses-sec{padding:56px 0}}
      `}</style>

      <LandingNav />

      <section className="page-hero" style={{backgroundImage:"url('/images/courses/courses-hero.png')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/courses/courses-hero.png')"}}></div>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Courses</span></div>
          <div className="sl center wh reveal">Our Programmes</div>
          <h1 className="reveal d2">Find Your <span>Perfect</span><br/>Quran Course</h1>
          <p className="reveal d3">From absolute beginners to advanced Hifz students — we have a course designed exactly for your level, age, and goals.</p>
          <Link href="/auth/signup" className="btn btn-gold reveal d4">Book Free Trial Lesson ✦</Link>
        </div>
      </section>

      <div className="trust-strip">
        <div className="container">
          <div className="tstrip-grid">
            {[{big:'6',lbl:'Courses Available'},{big:'500+',lbl:'Certified Teachers'},{big:'Free',lbl:'First Trial Lesson'},{big:'4.9★',lbl:'Average Rating'}].map((s,i) => (
              <div className={`tstrip-item reveal d${i+1}`} key={i}><div className="big">{s.big}</div><div className="lbl">{s.lbl}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <div className="container">
          {[{val:'all',label:'All Courses'},{val:'beginner',label:'Beginner'},{val:'intermediate',label:'Intermediate'},{val:'advanced',label:'Advanced'},{val:'kids',label:'For Kids'}].map(t => (
            <button key={t.val} className={`tab${filter===t.val?' active':''}`} onClick={() => setFilter(t.val)}>{t.label}</button>
          ))}
        </div>
      </div>

      <section className="courses-sec">
        <div className="container">
          <div className="cgrid">
            {filtered.map((c, i) => (
              <div className={`cc reveal d${(i % 3) + 1}`} key={i}>
                <div className="cc-inner">
                  <div className="cc-front">
                    <div className="cc-img">
                      <img src={c.img} alt={c.title} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <span className={`cc-lvl ${c.lvlCls}`}>{c.lvl}</span>
                    </div>
                    <div className="cc-body">
                      <div className="cc-ico">{c.ico}</div>
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                      <div className="cc-feats">{c.feats.map((f,j) => <div className="cc-feat" key={j}>{f}</div>)}</div>
                      <div className="cc-hint">✦ Hover to learn more</div>
                    </div>
                  </div>
                  <div className="cc-back">
                    <div className="cc-back-ico">{c.ico}</div>
                    <span className="cc-lvl-back">{c.lvl} · {c.age}</span>
                    <h4>{c.title}</h4>
                    <p>{c.back}</p>
                    <Link href="/platform/teachers" className="fbtn">Enroll Now →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hadith">
        <div className="container">
          <p className="hadith-ar reveal">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en reveal d2">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src reveal d3">— Sahih Al-Bukhari</p>
        </div>
      </div>

      <section style={{padding:'80px 0',background:'var(--cream)',textAlign:'center'}}>
        <div className="container">
          <div className="sl center reveal">Get Started</div>
          <h2 className="st reveal d2" style={{textAlign:'center',margin:'0 auto 16px'}}>Ready to <span>Start Learning?</span></h2>
          <p className="ss reveal d3" style={{margin:'0 auto 32px',textAlign:'center'}}>Browse our verified teachers and book your first free trial lesson today.</p>
          <div className="reveal d4" style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link href="/auth/signup" className="btn btn-gold">Book Free Trial ✦</Link>
            <Link href="/platform/teachers" className="btn btn-outline-green">Browse Teachers →</Link>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
