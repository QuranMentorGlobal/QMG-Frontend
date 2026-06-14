// src/app/page.tsx — QuranMentorGlobal Landing Page
'use client'

import { useEffect } from 'react'
import { SocialIcons, LandingFooter, LandingNav } from '@/components/landing/LandingLayout'
import Link from 'next/link'

export default function LandingPage() {
  useEffect(() => {
    // Loader
    const loader = document.getElementById('qmg-loader')
    const bar = document.getElementById('qmg-bar')
    if (bar) bar.style.width = '100%'
    setTimeout(() => {
      if (loader) { loader.style.opacity = '0'; setTimeout(() => { loader.style.display = 'none' }, 500) }
    }, 900)

    // Hero slider
    const slides = document.querySelectorAll<HTMLElement>('.hs')
    const dots = document.querySelectorAll<HTMLElement>('.sdot2')
    let cur = 0
    const goSlide = (n: number) => {
      slides[cur]?.classList.remove('active'); dots[cur]?.classList.remove('active')
      cur = n; slides[cur]?.classList.add('active'); dots[cur]?.classList.add('active')
    }
    ;(window as any).goHeroSlide = (n: number) => { clearInterval(timer); goSlide(n); timer = setInterval(() => goSlide((cur + 1) % slides.length), 5500) }
    let timer = setInterval(() => goSlide((cur + 1) % Math.max(slides.length, 1)), 5500)

    // Typewriter
    const el = document.querySelector<HTMLElement>('.hero-sub')
    const lines = [
      'Personalized 1-to-1 classes for all ages & levels.',
      'From Noorani Qaida to Hifz & Tafseer.',
      'Join 10,000+ students in 100+ countries.',
      'Book your free trial lesson today — no commitment.',
    ]
    let pi = 0, ci = 0, del = false
    const type = () => {
      if (!el) return
      const ph = lines[pi]
      el.textContent = del ? ph.slice(0, ci - 1) : ph.slice(0, ci + 1)
      del ? ci-- : ci++
      if (!del && ci === ph.length) { del = true; setTimeout(type, 2400); return }
      if (del && ci === 0) { del = false; pi = (pi + 1) % lines.length }
      setTimeout(type, del ? 32 : 52)
    }
    setTimeout(type, 1200)

    // Scroll-to-top
    const stbtn = document.getElementById('stbtn')
    const onScroll = () => { if (stbtn) stbtn.style.opacity = window.scrollY > 400 ? '1' : '0' }
    window.addEventListener('scroll', onScroll)

    // Animated counters
    const counters = document.querySelectorAll<HTMLElement>('[data-target]')
    const cobs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el2 = e.target as HTMLElement
        const t = parseInt(el2.dataset.target || '0')
        const isK = t >= 1000; const end = isK ? t / 1000 : t
        const sfx = el2.dataset.suffix || (isK ? 'K+' : '+')
        let cur2 = 0; const step = end / 60
        const iv = setInterval(() => {
          cur2 = Math.min(cur2 + step, end)
          el2.textContent = Math.round(cur2) + sfx
          if (cur2 >= end) clearInterval(iv)
        }, 25)
        cobs.unobserve(el2)
      })
    }, { threshold: 0.5 })
    counters.forEach(el2 => cobs.observe(el2))

    // Scroll reveal
    const reveals = document.querySelectorAll<HTMLElement>('.reveal,.reveal-left,.reveal-right,.reveal-up')
    const robs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add('visible'); robs.unobserve(e.target) } })
    }, { threshold: 0.12 })
    reveals.forEach(el2 => robs.observe(el2))

    // Contact form
    ;(window as any).submitForm = () => {
      const fn = (document.getElementById('fn') as HTMLInputElement)?.value.trim()
      const em = (document.getElementById('em') as HTMLInputElement)?.value.trim()
      const rl = (document.getElementById('rl') as HTMLSelectElement)?.value
      if (!fn || !em || !rl) { alert('Please fill in your name, email, and goal.'); return }
      if (!/\S+@\S+\.\S+/.test(em)) { alert('Please enter a valid email address.'); return }
      const form = document.getElementById('contactForm')
      const sb = document.getElementById('successBox')
      if (form) { form.style.opacity = '0'; setTimeout(() => { form.style.display = 'none'; if (sb) sb.style.display = 'block' }, 400) }
    }

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', onScroll)
      cobs.disconnect(); robs.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Amiri:wght@400;700&display=swap');
        :root{--green:#1B5E37;--green-dark:#0D3D20;--green-mid:#2A7A4A;--green-light:#3D9B5E;--gold:#B8952A;--gold-light:#D4AF50;--gold-pale:#F0E4B8;--cream:#F5F0E8;--cream-d:#EDE6D6;--td:#1A1A1A;--tm:#3D3D3D;--tl:#6B6B6B;--ff:'Playfair Display',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;--fa:'Amiri',serif;--r:12px;--rl:20px;--rx:28px;--sh:0 4px 24px rgba(0,0,0,.09);--shl:0 12px 48px rgba(0,0,0,.16);--ease:cubic-bezier(.4,0,.2,1)}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:var(--fb);color:var(--td);background:#fff;overflow-x:hidden;line-height:1.6}
        img{max-width:100%;display:block}a{text-decoration:none;color:inherit}ul{list-style:none}
        .container{max-width:1180px;margin:0 auto;padding:0 24px}

        /* ── SCROLL REVEAL ── */
        .reveal{opacity:0;transform:translateY(36px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
        .reveal-left.visible{opacity:1;transform:translateX(0)}
        .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
        .reveal-right.visible{opacity:1;transform:translateX(0)}
        .reveal-up{opacity:0;transform:translateY(24px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
        .reveal-up.visible{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.1s}.d2{transition-delay:.18s}.d3{transition-delay:.26s}.d4{transition-delay:.34s}.d5{transition-delay:.42s}.d6{transition-delay:.50s}

        /* ── FLIP CARD ── */
        .flip-card{perspective:1000px}
        .flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .flip-card:hover .flip-inner{transform:rotateY(180deg)}
        .flip-front,.flip-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:inherit}
        .flip-back{transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;gap:10px}
        .flip-back h4{font-family:var(--ff);font-size:19px;font-weight:700;color:#fff}
        .flip-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.7}
        .flip-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:50px;margin-top:6px;transition:transform .2s}
        .flip-back .fbtn:hover{transform:translateY(-2px)}
        .flip-back .fbo{font-size:32px;margin-bottom:4px}

        /* ── LOADER ── */
        #qmg-loader{position:fixed;inset:0;z-index:9999;background:var(--green-dark);display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .5s}
        .loader-top{font-family:var(--ff);font-size:26px;color:#fff;margin-bottom:8px}.loader-top span{color:var(--gold)}
        .loader-sub{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:40px}
        .loader-ring{width:52px;height:52px;border-radius:50%;border:2.5px solid rgba(184,149,42,.18);border-top-color:var(--gold);animation:spin 1s linear infinite;margin-bottom:32px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .loader-bar-wrap{width:200px;height:2px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
        .loader-bar{height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-light));border-radius:2px;transition:width 1.8s ease}

        /* ── BUTTONS ── */
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--fb);font-size:15px;font-weight:600;padding:15px 32px;border-radius:50px;border:none;cursor:pointer;transition:all .3s var(--ease);white-space:nowrap}
        .btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#fff;box-shadow:0 4px 20px rgba(184,149,42,.3)}.btn-gold:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(184,149,42,.45)}
        .btn-green{background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;box-shadow:0 4px 20px rgba(27,94,55,.3)}.btn-green:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(27,94,55,.45)}
        .btn-outline-white{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.45)}.btn-outline-white:hover{background:rgba(255,255,255,.1);border-color:#fff;transform:translateY(-3px)}
        .btn-outline-green{background:transparent;color:var(--green);border:2px solid var(--green)}.btn-outline-green:hover{background:var(--green);color:#fff;transform:translateY(-3px)}
        .btn-sm{padding:9px 20px;font-size:13px}

        /* ── TYPOGRAPHY ── */
        .sl{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:10px}
        .sl::before,.sl::after{content:'';flex:none;width:26px;height:1.5px;background:var(--gold)}
        .sl.center{justify-content:center}.sl.wh{color:var(--gold-light)}.sl.wh::before,.sl.wh::after{background:var(--gold-light)}
        .st{font-family:var(--ff);font-size:clamp(28px,4vw,46px);font-weight:700;color:var(--green-dark);line-height:1.18;margin-bottom:18px}.st span{color:var(--gold)}
        .ss{font-size:17px;color:var(--tm);line-height:1.78;max-width:560px}
        .section-hd{text-align:center;margin-bottom:64px}.section-hd .ss{margin:0 auto}

        /* ── NAV ── */
        .nav{background:rgba(255,255,255,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(27,94,55,.08);position:sticky;top:0;z-index:200;transition:all .4s var(--ease)}
        .nav.scrolled{box-shadow:0 4px 32px rgba(0,0,0,.1)}
        .nav .container{display:flex;align-items:center;justify-content:space-between;height:72px}
        .nav-logo{display:flex;align-items:center;gap:12px;cursor:pointer}
        .logo-img{height:46px;width:auto;border-radius:8px;object-fit:contain}
        .logo-txt .name{font-family:var(--ff);font-size:17px;font-weight:700;color:var(--green-dark);line-height:1.1}
        .logo-txt .name span{color:var(--gold)}.logo-txt .tag{font-size:9px;color:var(--tl);letter-spacing:.1em;text-transform:uppercase}
        .nav-links{display:flex;align-items:center;gap:2px}
        .nav-links a{font-size:14px;font-weight:500;color:var(--tm);padding:8px 13px;border-radius:8px;transition:all .22s}
        .nav-links a:hover,.nav-links a.active{color:var(--green);background:rgba(27,94,55,.06)}
        .nav-cta{display:flex;gap:10px;align-items:center}
        .ham{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px}
        .ham span{width:23px;height:2px;background:var(--green-dark);border-radius:2px;transition:all .3s;display:block}
        .ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}.ham.open span:nth-child(2){opacity:0}.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
        .mob-menu{display:none;position:fixed;top:72px;left:0;right:0;background:#fff;border-bottom:2px solid var(--green);padding:16px 24px;flex-direction:column;gap:4px;box-shadow:var(--shl);z-index:199}
        .mob-menu.open{display:flex}.mob-menu a{font-size:15px;font-weight:500;padding:11px 14px;border-radius:10px;color:var(--tm);transition:all .2s;display:block}.mob-menu a:hover{background:var(--cream);color:var(--green)}.mob-divider{height:1px;background:var(--cream-d);margin:8px 0}.mob-lang{padding:6px 14px}
        .lang-btn{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(27,94,55,.15);color:var(--tm);font-family:var(--fb);font-size:12px;font-weight:600;padding:7px 12px;border-radius:8px;cursor:pointer;transition:all .2s;white-space:nowrap}
        .lang-btn:hover{background:rgba(27,94,55,.07);border-color:var(--green);color:var(--green)}

        /* ── HERO ── */
        .hero{position:relative;min-height:100svh;background:var(--green-dark);overflow:hidden;display:flex;align-items:center}
        .hero-slider{position:absolute;inset:0;z-index:0}
        .hs{position:absolute;inset:0;opacity:0;transition:opacity 1.8s ease;overflow:hidden}
        .hs.active{opacity:1}
        .hs img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}
        .hs::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,rgba(13,61,32,.65) 0%,rgba(13,61,32,.45) 55%,rgba(13,61,32,.28) 100%);z-index:1}
        .hero-geo{position:absolute;inset:0;z-index:1;opacity:.022;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='40,6 46,26 66,20 54,36 70,40 54,44 66,60 46,54 40,74 34,54 14,60 26,44 10,40 26,36 14,20 34,26' fill='none' stroke='%23D4AF50' stroke-width='1'/%3E%3C/svg%3E");background-size:80px 80px}
        .hero-orb{position:absolute;border-radius:50%;filter:blur(70px);z-index:1;pointer-events:none}
        .orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(27,94,55,.55) 0%,transparent 70%);top:-120px;right:-80px;animation:f1 9s ease-in-out infinite}
        .orb2{width:360px;height:360px;background:radial-gradient(circle,rgba(184,149,42,.10) 0%,transparent 70%);bottom:-80px;left:5%;animation:f2 11s ease-in-out infinite}
        @keyframes f1{0%,100%{transform:translate(0,0)}33%{transform:translate(-25px,18px)}66%{transform:translate(18px,-25px)}}
        @keyframes f2{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}
        .hero-inner{position:relative;z-index:2;width:100%;padding:90px 0 70px}
        /* Hero content stagger animation */
        .hero-content > *{opacity:0;animation:heroIn .7s var(--ease) forwards}
        .hero-content > *:nth-child(1){animation-delay:.2s}
        .hero-content > *:nth-child(2){animation-delay:.38s}
        .hero-content > *:nth-child(3){animation-delay:.54s}
        .hero-content > *:nth-child(4){animation-delay:.68s}
        .hero-content > *:nth-child(5){animation-delay:.80s}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .hero-badge{display:inline-flex;align-items:center;gap:9px;background:rgba(184,149,42,.1);border:1px solid rgba(184,149,42,.3);color:var(--gold-light);font-size:13px;font-weight:500;padding:7px 20px;border-radius:50px;margin-bottom:28px}
        .hero-badge .dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.8);animation:pgreen 2s infinite}
        @keyframes pgreen{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(1.5)}}
        .hero-h{font-family:var(--ff);font-size:clamp(38px,5.8vw,68px);font-weight:800;color:#fff;line-height:1.1;margin-bottom:24px;text-shadow:0 2px 20px rgba(0,0,0,.45)}
        .hero-h .gold{color:var(--gold-light)}
        .hero-sub{font-size:clamp(18px,2.2vw,22px);color:rgba(255,255,255,.96);max-width:560px;line-height:1.72;margin-bottom:40px;min-height:68px;font-weight:500;text-shadow:0 1px 12px rgba(0,0,0,.5)}.hero-sub::after{content:'|';animation:blink .7s step-end infinite;color:var(--gold-light);margin-left:2px}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .hero-btns{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:52px}
        .hero-stats{display:flex;gap:44px;padding-top:28px;border-top:1px solid rgba(255,255,255,.1);flex-wrap:wrap}
        .hstat .n{font-family:var(--ff);font-size:30px;font-weight:700;color:var(--gold-light);line-height:1}
        .hstat .l{font-size:12px;color:rgba(255,255,255,.52);margin-top:4px}
        .slider-dots{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);z-index:4;display:flex;gap:8px}
        .sdot2{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.35);border:none;cursor:pointer;transition:all .35s;padding:0}
        .sdot2.active{background:var(--gold);width:24px;border-radius:4px}

        /* ── MARQUEE ── */
        .mq{background:var(--green);padding:14px 0;overflow:hidden}
        .mq-track{display:flex;gap:56px;animation:mq 30s linear infinite;white-space:nowrap;width:max-content}
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mq-item{display:inline-flex;align-items:center;gap:10px;font-size:14px;font-weight:500;color:rgba(255,255,255,.88)}
        .mq-sep{color:var(--gold-light);opacity:.55}

        /* ── FEATURES — flip cards ── */
        .features{padding:100px 0;background:var(--cream)}
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-bottom:44px}
        /* Each feature card is a flip card — fixed height for flip to work */
        .fc{height:420px;border-radius:var(--rl);perspective:1000px}
        .fc-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease);border-radius:var(--rl)}
        .fc:hover .fc-inner{transform:rotateY(180deg)}
        .fc-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;border-radius:var(--rl);overflow:hidden;border:1px solid transparent;box-shadow:var(--sh);display:flex;flex-direction:column;transition:border-color .3s,box-shadow .3s}
        .fc:hover .fc-front{border-color:var(--gold-pale);box-shadow:0 20px 56px rgba(0,0,0,.12)}
        .fc-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark) 0%,var(--green) 100%);border-radius:var(--rl);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;gap:12px}
        .fc-back-ico{font-size:40px;margin-bottom:4px;animation:floatMed 3.5s ease-in-out infinite}
        @keyframes floatMed{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fc-back h4{font-family:var(--ff);font-size:20px;font-weight:700;color:#fff}
        .fc-back p{font-size:13px;color:rgba(255,255,255,.78);line-height:1.72}
        .fc-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:13px;font-weight:700;padding:9px 22px;border-radius:50px;margin-top:4px;transition:transform .2s,box-shadow .2s}
        .fc-back .fbtn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(184,149,42,.4)}
        .fc-img{position:relative;width:100%;height:220px;overflow:hidden;background:var(--cream-d);flex-shrink:0}
        .fc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease);display:block}
        .fc:hover .fc-img img{transform:scale(1.07)}
        .fc-body{padding:22px 24px 0;flex:1}
        .fc-ico{width:40px;height:40px;background:linear-gradient(135deg,var(--green),var(--green-mid));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px}
        .fc-front h3{font-family:var(--ff);font-size:17px;font-weight:700;color:var(--green-dark);margin-bottom:8px}
        .fc-front p{font-size:13px;color:var(--tl);line-height:1.65}
        .fc-hint{font-size:11px;color:var(--gold);font-weight:600;padding:12px 24px;display:flex;align-items:center;gap:5px;margin-top:auto}

        /* ── ABOUT ── */
        .about{padding:100px 0;background:#fff;overflow:hidden}
        .about-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .about-imgw{position:relative}
        .about-main{border-radius:var(--rx);overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.14);position:relative;aspect-ratio:4/3;background:var(--cream-d)}
        .about-main img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
        .about-badge{position:absolute;top:-20px;left:-20px;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border-radius:16px;padding:16px 20px;box-shadow:0 8px 32px rgba(27,94,55,.35);text-align:center;animation:floatSlow 5s ease-in-out infinite}
        @keyframes floatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        .about-badge .num{font-family:var(--ff);font-size:30px;font-weight:800;color:var(--gold-light);line-height:1}
        .about-badge .lbl{font-size:11px;color:rgba(255,255,255,.65);margin-top:3px}
        .about-pts{display:flex;flex-direction:column;gap:14px;margin-bottom:34px}
        .apt{display:flex;align-items:center;gap:13px;font-size:14px;color:var(--tm);padding:11px 14px;border-radius:10px;transition:all .25s}
        .apt:hover{background:var(--cream);transform:translateX(4px)}
        .apt-ico{width:34px;height:34px;border-radius:50%;background:var(--gold-pale);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}

        /* ── COURSES — flip cards ── */
        .courses{padding:100px 0;background:var(--cream);overflow:hidden}
        .cgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-bottom:44px}
        .cc{height:360px;border-radius:var(--rl);perspective:1000px}
        .cc-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .65s var(--ease)}
        .cc:hover .cc-inner{transform:rotateY(180deg)}
        .cc-front{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fff;border-radius:var(--rl);overflow:hidden;box-shadow:var(--sh);display:flex;flex-direction:column}
        .cc-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(135deg,var(--green-dark),var(--green));border-radius:var(--rl);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;gap:10px}
        .cc-back-ico{font-size:36px;margin-bottom:4px}
        .cc-back h4{font-family:var(--ff);font-size:18px;font-weight:700;color:#fff}
        .cc-back p{font-size:12px;color:rgba(255,255,255,.75);line-height:1.65}
        .cc-back .fbtn{display:inline-flex;align-items:center;gap:6px;background:var(--gold);color:#fff;font-size:12px;font-weight:700;padding:8px 18px;border-radius:50px;margin-top:4px;transition:transform .2s}
        .cc-back .fbtn:hover{transform:translateY(-2px)}
        .cc-back .cc-lvl-back{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.15);color:var(--gold-light);letter-spacing:.08em;text-transform:uppercase}
        .cc-img{position:relative;width:100%;height:155px;overflow:hidden;background:var(--cream-d);flex-shrink:0}
        .cc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s;display:block}
        .cc:hover .cc-img img{transform:scale(1.08)}
        .cc-lvl{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;padding:4px 11px;border-radius:20px;letter-spacing:.08em;text-transform:uppercase;backdrop-filter:blur(8px)}
        .lv-b{background:rgba(74,222,128,.85);color:#064e3b}.lv-i{background:rgba(251,191,36,.85);color:#451a03}
        .lv-a{background:rgba(167,139,250,.85);color:#2e1065}.lv-s{background:rgba(13,61,32,.88);color:var(--gold-light)}
        .cc-body{padding:18px;flex:1;display:flex;flex-direction:column}
        .cc-front h3{font-family:var(--ff);font-size:15px;font-weight:700;color:var(--green-dark);margin-bottom:6px}
        .cc-front p{font-size:12px;color:var(--tl);line-height:1.6;flex:1}
        .cc-meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
        .cc-age{background:var(--cream);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;color:var(--tm)}
        .cc-hint{font-size:11px;color:var(--gold);font-weight:600;display:flex;align-items:center;gap:4px}

        /* ── HADITH ── */
        .hadith{background:linear-gradient(140deg,var(--green) 0%,var(--green-dark) 100%);padding:82px 0;text-align:center;position:relative;overflow:hidden}
        .hadith-ar{font-family:var(--fa);font-size:clamp(22px,3.5vw,38px);color:var(--gold-light);margin-bottom:16px;direction:rtl}
        .hadith-en{font-family:var(--ff);font-size:clamp(18px,2.8vw,28px);color:#fff;font-style:italic;margin-bottom:10px}
        .hadith-src{font-size:13px;color:rgba(255,255,255,.42)}

        /* ── HOW IT WORKS ── */
        .how{padding:100px 0;background:#fff;overflow:hidden}
        .how-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .how-img{border-radius:var(--rx);overflow:hidden;box-shadow:var(--shl);position:relative;aspect-ratio:5/4;background:var(--cream-d)}
        .how-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
        .steps{display:flex;flex-direction:column;gap:24px;margin-bottom:36px}
        .step{display:flex;gap:20px;padding:18px;border-radius:var(--r);transition:all .3s}
        .step:hover{background:var(--cream);transform:translateX(6px)}
        .step-n{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;font-family:var(--ff);font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 16px rgba(27,94,55,.3);transition:transform .3s}
        .step:hover .step-n{transform:scale(1.15) rotate(8deg)}
        .step-b h4{font-family:var(--ff);font-size:20px;font-weight:700;color:var(--green-dark);margin-bottom:5px}
        .step-b p{font-size:14px;color:var(--tl);line-height:1.68}

        /* ── TEACHERS — tilt cards ── */
        .teachers-sec{padding:100px 0;background:var(--green-dark);position:relative;overflow:hidden}
        .teachers-sec::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpolygon points='40,6 46,26 66,20 54,36 70,40 54,44 66,60 46,54 40,74 34,54 14,60 26,44 10,40 26,36 14,20 34,26' fill='none' stroke='%23D4AF50' stroke-width='.6'/%3E%3C/svg%3E");opacity:.025}
        .thd .st{color:#fff}.thd .ss{color:rgba(255,255,255,.6);margin:0 auto}
        .tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-bottom:44px}
        .tc{background:rgba(255,255,255,.05);border:1px solid rgba(184,149,42,.14);border-radius:var(--rl);overflow:hidden;transition:all .4s var(--ease)}
        .tc:hover{background:rgba(255,255,255,.1);border-color:rgba(184,149,42,.45);box-shadow:0 20px 50px rgba(0,0,0,.4);transform:translateY(-8px) scale(1.02)}
        .tc-img{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:rgba(255,255,255,.06)}
        .tc-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;transition:transform .5s;filter:brightness(.9);display:block}
        .tc:hover .tc-img img{transform:scale(1.06);filter:brightness(1)}
        .tc-body{padding:20px;text-align:center}
        .tc-body h4{font-family:var(--ff);font-size:17px;font-weight:700;color:#fff;margin-bottom:4px}
        .tc-spec{font-size:12px;color:var(--gold-light);margin-bottom:4px;font-weight:500}
        .tc-origin{font-size:12px;color:rgba(255,255,255,.42);margin-bottom:9px}
        .tc-stars{color:var(--gold);font-size:13px}

        /* ── TESTIMONIALS ── */
        .testi{padding:100px 0;background:var(--cream);overflow:hidden}
        .tsgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
        .tsc{background:#fff;border-radius:var(--rl);padding:32px 28px;border:1px solid var(--cream-d);transition:all .4s var(--ease);position:relative}
        .tsc:hover{box-shadow:0 20px 50px rgba(0,0,0,.09);transform:translateY(-6px);border-color:var(--gold-pale)}
        .tsc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--green),var(--gold));border-radius:var(--rl) var(--rl) 0 0;transform:scaleX(0);transition:transform .4s var(--ease);transform-origin:left}
        .tsc:hover::before{transform:scaleX(1)}
        .tsc-q{font-size:60px;color:var(--gold);font-family:Georgia,serif;line-height:.5;margin-bottom:16px;display:block}
        .tsc-txt{font-size:15px;color:var(--tm);line-height:1.78;margin-bottom:22px;font-style:italic}
        .tsc-auth{display:flex;align-items:center;gap:12px}
        .tsc-av{width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;border:2.5px solid var(--gold-pale);background:var(--cream-d);position:relative}
        .tsc-av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
        .tsc-name{font-size:14px;font-weight:700;color:var(--green-dark)}
        .tsc-loc{font-size:12px;color:var(--tl)}
        .tsc-stars{color:var(--gold);font-size:12px;margin-top:2px}

        /* ── STATS ── */
        .stats-sec{background:linear-gradient(135deg,var(--green) 0%,var(--green-dark) 100%);padding:80px 0;position:relative;overflow:hidden}
        .sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center;position:relative;z-index:1}
        .si{transition:transform .3s}
        .si:hover{transform:translateY(-6px)}
        .si .big{font-family:var(--ff);font-size:clamp(38px,5vw,54px);font-weight:800;color:var(--gold-light);line-height:1;margin-bottom:8px}
        .si .lbl{font-size:14px;color:rgba(255,255,255,.62)}

        /* ── CTA ── */
        .ctab{padding:100px 0;background:var(--cream)}
        .ctab-inner{background:linear-gradient(120deg,var(--green-dark) 0%,var(--green) 55%,var(--green-mid) 100%);border-radius:32px;padding:70px 64px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:center;position:relative;overflow:hidden}
        .ctab-inner::before{content:'';position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:rgba(212,175,80,.07);animation:floatSlow 6s ease-in-out infinite}
        .ctab h2{font-family:var(--ff);font-size:clamp(28px,3.5vw,44px);font-weight:800;color:#fff;margin-bottom:14px;line-height:1.18}
        .ctab h2 span{color:var(--gold-light)}.ctab p{font-size:17px;color:rgba(255,255,255,.7);max-width:480px;line-height:1.7}
        .ctab-btns{display:flex;gap:14px;flex-direction:column;flex-shrink:0;position:relative;z-index:1}

        /* ── CONTACT ── */
        .contact-sec{padding:100px 0;background:#fff;overflow:hidden}
        .contact-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
        .ci{display:flex;align-items:flex-start;gap:15px;padding:12px;border-radius:12px;transition:all .25s}
        .ci:hover{background:var(--cream);transform:translateX(4px)}
        .ci-ico{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
        .ci-b h4{font-size:14px;font-weight:600;color:var(--green-dark);margin-bottom:2px}
        .ci-b p{font-size:13px;color:var(--tl)}
        .cform{background:var(--cream);border-radius:var(--rl);padding:44px;border-top:4px solid var(--gold);box-shadow:var(--sh)}
        .cform h3{font-family:var(--ff);font-size:26px;font-weight:700;color:var(--green-dark);margin-bottom:6px}
        .fg{margin-bottom:16px}.fg label{display:block;font-size:13px;font-weight:600;color:var(--tm);margin-bottom:6px}
        .fg input,.fg select,.fg textarea{width:100%;padding:12px 16px;border:1.5px solid #E0DDD5;border-radius:10px;font-family:var(--fb);font-size:14px;color:var(--td);background:#fff;transition:all .25s;outline:none}
        .fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(27,94,55,.1)}
        .fg textarea{min-height:108px;resize:vertical}.fg-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .fsub{width:100%;padding:15px;font-size:16px;border-radius:12px;margin-top:4px;cursor:pointer}
        .success-box{display:none;text-align:center;padding:24px;background:linear-gradient(135deg,#e8f5ee,#d4eee1);border-radius:12px;color:var(--green);font-weight:500;margin-top:14px;font-size:15px;line-height:1.7}

        /* ── FOOTER ── */
        .footer{background:var(--green-dark);padding:64px 0 0;position:relative;overflow:hidden}
        .footer-line{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
        .fgrid{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:48px;margin-bottom:40px}
        .footer-logo{display:flex;align-items:center;gap:10px;margin-bottom:14px}
        .footer-logo-img{height:38px;width:auto;border-radius:6px;object-fit:contain}
        .fb-name{font-family:var(--ff);font-size:18px;font-weight:700;color:#fff;line-height:1.1}
        .fb-name span{color:var(--gold)}.fb-tag{font-size:9px;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;margin-top:2px}
        .fb-desc{font-size:13px;color:rgba(255,255,255,.45);line-height:1.8;margin-bottom:16px}
        .footer-contact-row{display:flex;flex-direction:column;gap:6px;margin-bottom:18px}
        .footer-link-pill{font-size:12px;color:rgba(255,255,255,.5);transition:color .2s;display:inline-flex;align-items:center;gap:6px}
        .footer-link-pill:hover{color:var(--gold-light)}
        .fcol h4,.fcol-hd{font-size:11px;font-weight:700;color:var(--gold-light);text-transform:uppercase;letter-spacing:.12em;margin-bottom:16px}
        .fcol ul{display:flex;flex-direction:column;gap:10px}
        .fcol ul li a{font-size:13px;color:rgba(255,255,255,.45);transition:all .2s;display:inline-block}
        .fcol ul li a:hover{color:var(--gold-light);transform:translateX(4px)}
        .soc-icon:hover{background:var(--gold)!important;color:#fff!important;border-color:var(--gold)!important;transform:translateY(-3px) scale(1.08)}
        .footer-ayah{display:flex;align-items:center;gap:14px;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:16px 0;margin-bottom:20px;flex-wrap:wrap}
        .fayah-ar{font-family:var(--fa);font-size:16px;color:var(--gold-light);direction:rtl;flex-shrink:0}
        .fayah-sep{color:rgba(255,255,255,.2)}.fayah-en{font-size:12px;color:rgba(255,255,255,.35);font-style:italic}
        .fbot{padding:16px 0 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
        .fbot p{font-size:12px;color:rgba(255,255,255,.25)}
        .fbot-links{display:flex;gap:10px;align-items:center;font-size:12px;color:rgba(255,255,255,.35)}
        .fbot-links a{color:rgba(255,255,255,.35);transition:color .2s}.fbot-links a:hover{color:var(--gold-light)}.fbot-links span{opacity:.4}

        /* ── SCROLL TO TOP ── */
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
        #stbtn:hover{transform:translateY(-4px) scale(1.05)}

        /* ── RESPONSIVE ── */
        @media(max-width:1024px){.fgrid{grid-template-columns:1fr 1fr;gap:32px}.feat-grid{grid-template-columns:repeat(2,1fr)}.cgrid{grid-template-columns:repeat(2,1fr)}.tgrid{grid-template-columns:repeat(2,1fr)}.tsgrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:900px){.nav-links,.nav-cta{display:none}.ham{display:flex}.about-inner,.how-inner,.contact-inner{grid-template-columns:1fr;gap:48px}}
        @media(max-width:768px){.nav-links,.nav-cta{display:none!important}.ham{display:flex!important}.hero-inner{padding:80px 0 60px}.hero-stats{gap:20px}.fgrid{grid-template-columns:1fr;gap:24px}.cgrid{grid-template-columns:1fr}.cc{height:auto}.cc-inner{position:static;transform:none!important}.cc-back{display:none}.cc-front{position:static;transform:none}.tgrid{grid-template-columns:1fr 1fr}.tsgrid{grid-template-columns:1fr}.sgrid{grid-template-columns:repeat(2,1fr);gap:20px}.ctab-inner{grid-template-columns:1fr!important;text-align:center;padding:40px 24px}.ctab-btns{flex-direction:row;justify-content:center;flex-wrap:wrap}.section-hd{margin-bottom:40px}.feat-grid{grid-template-columns:1fr}.fc{height:auto}.fc-inner{position:static;transform:none!important}.fc-back{display:none}.fc-front{position:static;transform:none}.features,.about,.courses,.how,.teachers-sec,.testi,.stats-sec,.ctab,.contact-sec{padding:64px 0}.cform{padding:28px 20px}.fg-row{grid-template-columns:1fr}.footer-ayah{flex-direction:column;gap:8px}}
        @media(max-width:480px){.hero-btns{flex-direction:column;align-items:flex-start}.hero-btns .btn{width:100%;justify-content:center}.tgrid{grid-template-columns:1fr}.ctab-inner{padding:32px 20px}.ctab-btns .btn{width:100%;justify-content:center}}
        @media(prefers-reduced-motion:reduce){.reveal,.reveal-left,.reveal-right,.reveal-up{opacity:1!important;transform:none!important;transition:none!important}.hero-content > *{animation:none!important;opacity:1!important}.fc-inner,.cc-inner{transition:none!important}.floatSlow,.floatMed{animation:none!important}}
      `}</style>

      {/* LOADER */}
      <div id="qmg-loader">
        <div className="loader-top">Quran <span>Mentor</span> Global</div>
        <div className="loader-sub">Connecting Hearts Worldwide</div>
        <div className="loader-ring"></div>
        <div className="loader-bar-wrap"><div className="loader-bar" id="qmg-bar"></div></div>
      </div>

      <LandingNav />

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-slider">
          <div className="hs hs1 active">
            <img src="/images/hero/hero-1.png" alt="Students learning Quran online" fetchPriority="high" decoding="async" />
          </div>
          <div className="hs hs2">
            <img src="/images/hero/hero-2.png" alt="Live Quran lesson with certified teacher" loading="lazy" decoding="async" />
          </div>
          <div className="hs hs3">
            <img src="/images/hero/hero-3.png" alt="Quran and Islamic learning environment" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="hero-geo"></div>
        <div className="hero-orb orb1"></div>
        <div className="hero-orb orb2"></div>
        <div className="hero-inner">
          <div className="container">
            {/* hero-content triggers stagger animation */}
            <div className="hero-content">
              <div className="hero-badge"><span className="dot"></span> Now Enrolling — All Ages &amp; Levels</div>
              <h1 className="hero-h">Learn Quran with <span className="gold">Expert Qaris</span> &amp; Teachers Worldwide</h1>
              <p className="hero-sub">Personalized 1-to-1 classes for all ages &amp; levels.</p>
              <div className="hero-btns">
                <Link href="/auth/signup" className="btn btn-gold">Book Free Trial Lesson ✦</Link>
                <Link href="/courses" className="btn btn-outline-white">Explore Courses →</Link>
              </div>
              <div className="hero-stats">
                <div className="hstat"><div className="n">500+</div><div className="l">Certified Teachers</div></div>
                <div className="hstat"><div className="n">10K+</div><div className="l">Happy Students</div></div>
                <div className="hstat"><div className="n">100+</div><div className="l">Countries</div></div>
                <div className="hstat"><div className="n">24/7</div><div className="l">Support</div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="slider-dots">
          <button className="sdot2 active" onClick={() => (window as any).goHeroSlide?.(0)}></button>
          <button className="sdot2" onClick={() => (window as any).goHeroSlide?.(1)}></button>
          <button className="sdot2" onClick={() => (window as any).goHeroSlide?.(2)}></button>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="mq">
        <div className="mq-track">
          {['📖 Noorani Qaida','🎙️ Tajweed Mastery','🌙 Hifz Programme','📚 Tafseer Classes','👨‍👩‍👧 Kids & Adults','🌍 100+ Countries','🎓 Verified Ijazah','🔒 Safe Platform',
            '📖 Noorani Qaida','🎙️ Tajweed Mastery','🌙 Hifz Programme','📚 Tafseer Classes','👨‍👩‍👧 Kids & Adults','🌍 100+ Countries','🎓 Verified Ijazah','🔒 Safe Platform'].map((item, i) => (
            <span key={i} className="mq-item">{item}{i % 2 === 1 ? '' : <span className="mq-sep"> ✦</span>}</span>
          ))}
        </div>
      </div>

      {/* FEATURES — flip cards */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Why Choose Us</div>
            <h2 className="st">Everything You Need to <span>Learn Quran Online</span></h2>
            <p className="ss">We built Quran Mentor Global to make authentic Quran education accessible to every Muslim — with the quality of a local scholar, from anywhere in the world.</p>
          </div>
          <div className="feat-grid">
            {[
              { img:'/images/features/expert-teachers.png',   ico:'🎓', title:'Expert Teachers',    desc:'Learn from qualified Qaris with verified Ijazah certifications and years of teaching experience across all levels.',    back:'Every teacher holds a verified Ijazah — an unbroken chain of Quranic knowledge passed down through generations.', link:'/platform/teachers', linkTxt:'Meet Teachers' },
              { img:'/images/features/live-classes.png',      ico:'🎥', title:'Live 1-to-1 Classes', desc:'Personalized attention in private HD video sessions. No large groups — just you and your dedicated teacher.',            back:'HD video lessons with screen sharing, digital Quran, and real-time Tajweed correction — just like being in the room.', link:'/courses', linkTxt:'View Courses' },
              { img:'/images/features/flexible-schedule.png', ico:'🗓️', title:'Flexible Schedule',   desc:'Book lessons that fit your timezone and lifestyle. Morning, evening, or weekend — you choose exactly when you learn.', back:'Available 7 days a week across all timezones. Reschedule anytime with 24 hours notice — zero hassle.', link:'/auth/signup', linkTxt:'Get Started' },
              { img:'/images/features/safe-secure.png',       ico:'🔒', title:'Safe & Secure',       desc:'Every teacher is background-checked and verified. Full parent monitoring available for all children\'s classes.',     back:'Parents can join any lesson, receive progress reports, and set lesson reminders. Safety is our highest priority.', link:'/about', linkTxt:'Learn More' },
              { img:'/images/features/track-progress.png',    ico:'📊', title:'Track Progress',      desc:'Visual dashboards showing lesson history, Surah completion milestones, and detailed teacher feedback reports.',        back:'Your personal dashboard shows every lesson, every Surah completed, and your teacher\'s detailed feedback.', link:'/auth/signup', linkTxt:'Sign Up' },
              { img:'/images/features/global-community.png',  ico:'🌍', title:'Global Community',    desc:'Connecting hearts from Pakistan, UK, USA, Gulf and beyond. One Ummah, one shared mission of Quranic learning.',       back:'Students from 100+ countries, teachers from Pakistan, Egypt, Saudi Arabia and beyond — all in one place.', link:'/about', linkTxt:'Our Story' },
            ].map((f, i) => (
              <div className={`fc reveal d${i + 1}`} key={i}>
                <div className="fc-inner">
                  {/* Front */}
                  <div className="fc-front">
                    <div className="fc-img">
                      <img src={f.img} alt={f.title} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                    <div className="fc-body">
                      <div className="fc-ico">{f.ico}</div>
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                    <div className="fc-hint">✦ Hover to learn more</div>
                  </div>
                  {/* Back */}
                  <div className="fc-back">
                    <div className="fc-back-ico">{f.ico}</div>
                    <h4>{f.title}</h4>
                    <p>{f.back}</p>
                    <Link href={f.link} className="fbtn">{f.linkTxt} →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-inner">
            <div className="about-imgw reveal-left">
              <div className="about-main">
                <img src="/images/home/about-home.png" alt="Student learning Quran online" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
              <div className="about-badge"><div className="num">10K+</div><div className="lbl">Happy Students</div></div>
            </div>
            <div className="reveal-right">
              <div className="sl">Our Story</div>
              <h2 className="st">Guiding Hearts.<br/><span>Building Character.</span></h2>
              <p className="ss" style={{marginBottom:28}}>Founded by Hafiz Awais — an ACCA professional and Hafiz-e-Quran — who set out to solve a real problem: Muslims worldwide struggling to find qualified, trusted Quran teachers for themselves and their children.</p>
              <div className="about-pts">
                {[
                  { ico:'✅', txt:'Founded by a Hafiz-e-Quran with deep roots in Quranic education' },
                  { ico:'🌍', txt:'Serving students across Pakistan, UK, USA, Gulf and beyond' },
                  { ico:'🎓', txt:'All teachers hold verified Ijazah certifications' },
                  { ico:'👨‍👩‍👧', txt:'Special programmes for children, adults, and senior learners' },
                ].map((p, i) => (
                  <div className="apt" key={i}><div className="apt-ico">{p.ico}</div><span>{p.txt}</span></div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn btn-green">Start Learning Today →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* COURSES — flip cards */}
      <section className="courses" id="courses">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Our Courses</div>
            <h2 className="st">What Would You Like to <span>Learn?</span></h2>
            <p className="ss">From beginners taking their very first steps to advanced students memorizing the entire Quran — we have the right programme for every level.</p>
          </div>
          <div className="cgrid">
            {[
              { img:'/images/courses-cards/noorani-qaida.png', lvlCls:'lv-b', lvl:'Beginner',    title:'Noorani Qaida',        desc:'Master Arabic letters and basic pronunciation.',           back:'The essential first step for every learner. Master the Arabic alphabet, vowels, and basic word joining.',         age:'All Ages',  ico:'🔤' },
              { img:'/images/courses-cards/tajweed.png',       lvlCls:'lv-i', lvl:'Intermediate', title:'Tajweed Rules',         desc:'Perfect your recitation with the rules of Tajweed.',       back:'Learn Makharij, Noon & Meem rules, and Waqf — recite the Quran exactly as it was revealed to the Prophet ﷺ.',   age:'8+ Years',  ico:'🎵' },
              { img:'/images/courses-cards/hifz.png',          lvlCls:'lv-a', lvl:'Advanced',     title:'Hifz (Memorization)',   desc:'Memorize the Quran with a dedicated Hafiz mentor.',        back:'Structured daily targets, smart revision schedules, and a dedicated Hafiz mentor guiding every step.',           age:'7+ Years',  ico:'📖' },
              { img:'/images/courses-cards/tafseer.png',       lvlCls:'lv-s', lvl:'Scholarly',    title:'Tafseer & Translation', desc:'Understand the deeper meaning of Quranic verses.',         back:'Verse by verse analysis, historical context, and Arabic comprehension — deepen your connection with Allah\'s words.', age:'Adults', ico:'🌙' },
            ].map((c, i) => (
              <div className={`cc reveal d${i + 1}`} key={i}>
                <div className="cc-inner">
                  {/* Front */}
                  <div className="cc-front">
                    <div className="cc-img">
                      <img src={c.img} alt={c.title} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <span className={`cc-lvl ${c.lvlCls}`}>{c.lvl}</span>
                    </div>
                    <div className="cc-body">
                      <h3>{c.title}</h3>
                      <p>{c.desc}</p>
                      <div className="cc-meta">
                        <span className="cc-age">{c.age}</span>
                        <span className="cc-hint">✦ Hover</span>
                      </div>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="cc-back">
                    <div className="cc-back-ico">{c.ico}</div>
                    <span className="cc-lvl-back">{c.lvl}</span>
                    <h4>{c.title}</h4>
                    <p>{c.back}</p>
                    <Link href="/platform/teachers" className="fbtn">Enroll Now →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
            <Link href="/platform/teachers" className="btn btn-green">Browse All Teachers →</Link>
          </div>
        </div>
      </section>

      {/* HADITH */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar reveal">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en reveal d2">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src reveal d3">— Sahih Al-Bukhari</p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="how-inner">
            <div className="reveal-left">
              <div className="how-img">
                <img src="/images/home/how-it-works.png" alt="How it works" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            </div>
            <div className="reveal-right">
              <div className="sl">How It Works</div>
              <h2 className="st">Start Learning in<br/><span>3 Simple Steps</span></h2>
              <p className="ss" style={{marginBottom:32}}>No complicated process. Book your first class and begin your Quranic journey within minutes.</p>
              <div className="steps">
                {[
                  { n:'1', title:'Create Your Account',  desc:'Sign up as a student or parent. Tell us your level, goals, and preferred schedule — takes under 2 minutes.' },
                  { n:'2', title:'Choose Your Teacher',  desc:'Browse verified Qaris by specialization, language, and availability. Book a free trial lesson.' },
                  { n:'3', title:'Start Your Journey',   desc:'Join your live video session, track your progress after every lesson, and grow spiritually at your own pace.' },
                ].map((s, i) => (
                  <div className="step" key={i}>
                    <div className="step-n">{s.n}</div>
                    <div className="step-b"><h4>{s.title}</h4><p>{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <Link href="/auth/signup" className="btn btn-green">Get Started Today →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="teachers-sec" id="teachers">
        <div className="container">
          <div className="section-hd thd reveal">
            <div className="sl center wh">Our Teachers</div>
            <h2 className="st">Learn from the Best <span>Qaris</span></h2>
            <p className="ss">Every teacher is thoroughly vetted — verified Ijazah, background-checked, and rated by real students before joining our platform.</p>
          </div>
          <div className="tgrid">
            {[
              { img:'/images/teachers/teacher-1.png', name:'Qari Abdullah',  spec:'Tajweed & Hifz Specialist',  origin:'🇵🇰 Pakistan',     stars:'★★★★★ 4.9' },
              { img:'/images/teachers/teacher-2.png', name:'Sheikh Ibrahim', spec:'Tafseer & Advanced Quran',    origin:'🇸🇦 Saudi Arabia', stars:'★★★★★ 4.8' },
              { img:'/images/teachers/teacher-3.png', name:'Qari Yusuf',     spec:'Noorani Qaida · Kids',        origin:'🇵🇰 Pakistan',     stars:'★★★★★ 5.0' },
              { img:'/images/teachers/teacher-4.png', name:'Ustadh Bilal',   spec:'Hifz · Memorization',         origin:'🇪🇬 Egypt',        stars:'★★★★★ 4.9' },
            ].map((t, i) => (
              <div className={`tc reveal d${i + 1}`} key={i}>
                <div className="tc-img">
                  <img src={t.img} alt={t.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div className="tc-body">
                  <h4>{t.name}</h4>
                  <div className="tc-spec">{t.spec}</div>
                  <div className="tc-origin">{t.origin}</div>
                  <div className="tc-stars">{t.stars}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center'}}>
            <Link href="/platform/teachers" className="btn btn-gold">Meet All Teachers ✦</Link>
            <p style={{color:'rgba(255,255,255,.4)',fontSize:13,marginTop:14}}>All verified · Background-checked · Free trial for new students</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testi" id="testimonials">
        <div className="container">
          <div className="section-hd reveal">
            <div className="sl center">Student Stories</div>
            <h2 className="st">Voices from Our <span>Global Community</span></h2>
            <p className="ss">Thousands of students and families have transformed their relationship with the Quran through our platform.</p>
          </div>
          <div className="tsgrid">
            {[
              { txt:"My daughter started with zero Arabic knowledge. Within 3 months she is now reciting fluently with Tajweed. The teacher is so patient and the platform is very easy to use.", name:'Amina K.',  loc:'🇬🇧 Birmingham, UK',  img:'/images/testimonials/student-1.png' },
              { txt:"As a working professional I could never find time for in-person classes. This platform lets me learn Tajweed at my own pace after work. Best decision I ever made.",            name:'Hassan R.', loc:'🇦🇪 Dubai, UAE',       img:'/images/testimonials/student-2.png' },
              { txt:"Finding a qualified Hafiz locally in Texas was near impossible. Quran Mentor Global solved that completely. My son is now in his second year of Hifz. Alhamdulillah.",       name:'Tariq M.',  loc:'🇺🇸 Houston, USA',     img:'/images/testimonials/student-3.png' },
            ].map((t, i) => (
              <div className={`tsc reveal d${i + 1}`} key={i}>
                <span className="tsc-q">"</span>
                <p className="tsc-txt">{t.txt}</p>
                <div className="tsc-auth">
                  <div className="tsc-av"><img src={t.img} alt={t.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
                  <div><div className="tsc-name">{t.name}</div><div className="tsc-loc">{t.loc}</div><div className="tsc-stars">★★★★★</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-sec">
        <div className="container">
          <div className="sgrid">
            <div className="si reveal d1"><div className="big" data-target="10000">0</div><div className="lbl">Happy Students</div></div>
            <div className="si reveal d2"><div className="big" data-target="500">0</div><div className="lbl">Certified Teachers</div></div>
            <div className="si reveal d3"><div className="big" data-target="100">0</div><div className="lbl">Countries Connected</div></div>
            <div className="si reveal d4"><div className="big" data-suffix="/7">24</div><div className="lbl">Support Available</div></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ctab">
        <div className="container">
          <div className="ctab-inner reveal">
            <div>
              <h2>Ready to Begin Your<br/><span>Quranic Journey?</span></h2>
              <p>Join thousands of students learning Quran online with expert certified teachers. Your first trial lesson is completely free.</p>
            </div>
            <div className="ctab-btns">
              <Link href="/auth/signup" className="btn btn-gold">Sign Up Free ✦</Link>
              <Link href="/platform/teachers" className="btn btn-outline-white">Meet Our Teachers</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-sec" id="contact">
        <div className="container">
          <div className="contact-inner">
            <div className="contact-info reveal-left">
              <div className="sl">Get in Touch</div>
              <h2 className="st">Start Your <span>Free Trial</span> Today</h2>
              <p className="ss" style={{marginBottom:32}}>Fill in the form and we'll match you with the perfect teacher within 24 hours. Your first lesson is completely free — no commitment required.</p>
              <div style={{display:'flex',flexDirection:'column',gap:18,marginBottom:32}}>
                {[
                  { ico:'🌐', title:'Website',       val:'www.QuranMentorGlobal.com' },
                  { ico:'📧', title:'Email',         val:'info@quranmentorglobal.com' },
                  { ico:'📱', title:'WhatsApp',      val:'Available 24/7 for enquiries' },
                  { ico:'🕐', title:'Response Time', val:'Within 24 hours guaranteed' },
                ].map((c, i) => (
                  <div className="ci" key={i}><div className="ci-ico">{c.ico}</div><div className="ci-b"><h4>{c.title}</h4><p>{c.val}</p></div></div>
                ))}
              </div>
              <SocialIcons />
            </div>
            <div className="reveal-right">
              <div className="cform">
                <h3>Book Your Free Lesson</h3>
                <p style={{fontSize:14,color:'var(--tl)',marginBottom:26}}>No credit card needed. Just fill in your details and we'll be in touch.</p>
                <div id="contactForm">
                  <div className="fg-row">
                    <div className="fg"><label>First Name</label><input type="text" id="fn" placeholder="Ahmed" /></div>
                    <div className="fg"><label>Last Name</label><input type="text" id="ln" placeholder="Khan" /></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="email" id="em" placeholder="ahmed@example.com" /></div>
                  <div className="fg"><label>WhatsApp Number</label><input type="tel" id="ph" placeholder="+44 7700 000000" /></div>
                  <div className="fg"><label>Country</label>
                    <select id="ct"><option value="">Select your country</option>
                      {['Pakistan','United Kingdom','United Arab Emirates','United States','Saudi Arabia','Canada','Australia','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>I want to</label>
                    <select id="rl"><option value="">Select your goal</option>
                      <option>Learn Quran (Adult Student)</option><option>Enroll my child (Parent)</option>
                      <option>Learn Tajweed specifically</option><option>Join the Hifz programme</option>
                      <option>Teach on the platform (Qari)</option>
                    </select>
                  </div>
                  <div className="fg"><label>Message (optional)</label><textarea id="msg" placeholder="Tell us about your background and goals..."></textarea></div>
                  <button className="btn btn-green fsub" onClick={() => (window as any).submitForm?.()}>Book My Free Trial Lesson →</button>
                  <p style={{textAlign:'center',fontSize:12,color:'var(--tl)',marginTop:10}}>🔒 Your details are private. We never share your information.</p>
                </div>
                <div className="success-box" id="successBox">
                  🌙 JazakAllah Khair! We've received your request.<br/>Our team will contact you within 24 hours. ✦
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
