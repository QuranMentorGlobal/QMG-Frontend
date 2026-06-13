// src/components/landing/LandingLayout.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Social Icons ──────────────────────────────────────────────────────────────

const FB_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
)
const IG_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const YT_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM10 15.5v-7l6 3.5-6 3.5z" />
  </svg>
)
const WA_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.123 1.529 5.856L.057 23.882l6.188-1.637A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-5.017-1.381l-.36-.214-3.727.984.993-3.641-.235-.374A9.79 9.79 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182 17.42 2.182 21.818 6.58 21.818 12c0 5.42-4.398 9.818-9.818 9.818z" />
  </svg>
)

export const SocialIcons = ({ dark = false }: { dark?: boolean }) => (
  <div style={{ display: 'flex', gap: 10 }}>
    {[
      { href: 'https://facebook.com/QuranMentorGlobal', icon: FB_SVG, label: 'Facebook' },
      { href: 'https://instagram.com/QuranMentorGlobal', icon: IG_SVG, label: 'Instagram' },
      { href: 'https://youtube.com/@QuranMentorGlobal', icon: YT_SVG, label: 'YouTube' },
      { href: 'https://wa.me/message/QuranMentorGlobal', icon: WA_SVG, label: 'WhatsApp' },
    ].map((s, i) => (
      <a
        key={i}
        href={s.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={s.label}
        className="soc-icon"
        style={{
          width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: dark ? 'rgba(255,255,255,.07)' : 'var(--cream)',
          border: dark ? '1px solid rgba(184,149,42,.18)' : '1px solid var(--cream-d)',
          color: dark ? 'rgba(255,255,255,.6)' : 'var(--tm)',
          transition: 'all .3s', cursor: 'pointer', flexShrink: 0,
        }}
      >
        {s.icon}
      </a>
    ))}
  </div>
)

// ── Language Dropdown ─────────────────────────────────────────────────────────

const GLOBE_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
]

function LangDropdown() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('en')
  const current = LANGUAGES.find(l => l.code === selected) || LANGUAGES[0]

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.lang-drop')) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  return (
    <div className="lang-drop" style={{ position: 'relative' }}>
      <button
        className="lang-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        aria-expanded={open}
      >
        {GLOBE_SVG}
        <span>{current.native}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              role="menuitem"
              className={`lang-opt${selected === l.code ? ' active' : ''}`}
              onClick={() => { setSelected(l.code); setOpen(false) }}
            >
              <span>{l.native}</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>{l.label}</span>
            </button>
          ))}
          <div className="lang-soon">More languages coming soon</div>
        </div>
      )}
    </div>
  )
}

// ── Navigation ─────────────────────────────────────────────────────────────────

export const LandingNav = () => {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nav = document.getElementById('qmg-nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    // expose for page.tsx that uses window.toggleMenu
    ;(window as any).toggleMenu = () => setMenuOpen(o => !o)
    ;(window as any).closeMenu  = () => setMenuOpen(false)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const links = [
    { href: '/',         label: 'Home'     },
    { href: '/about',    label: 'About'    },
    { href: '/courses',  label: 'Courses'  },
    { href: '/teachers', label: 'Teachers' },
    { href: '/contact',  label: 'Contact'  },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ── Main Nav ── */}
      <nav className="nav" id="qmg-nav">
        <div className="container">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <img
              src="/logo.png"
              alt="QuranMentorGlobal"
              className="logo-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="logo-txt">
              <div className="name">Quran <span>Mentor</span> Global</div>
              <div className="tag">Learn · Connect · Grow</div>
            </div>
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            {links.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={isActive(l.href) ? 'active' : ''}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="nav-cta">
            <LangDropdown />
            <Link href="/auth/login"  className="btn btn-outline-green btn-sm">Login</Link>
            <Link href="/auth/signup" className="btn btn-green btn-sm">Sign Up Free →</Link>
          </div>

          {/* Hamburger */}
          <button
            className={`ham${menuOpen ? ' open' : ''}`}
            id="ham"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mob-menu${menuOpen ? ' open' : ''}`} id="mobMenu">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? 'mob-active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mob-divider" />
          <div className="mob-lang"><LangDropdown /></div>
          <Link href="/auth/login"  onClick={() => setMenuOpen(false)}>Login</Link>
          <Link
            href="/auth/signup"
            className="btn btn-green"
            style={{ textAlign: 'center', justifyContent: 'center', marginTop: 4 }}
            onClick={() => setMenuOpen(false)}
          >
            Sign Up Free →
          </Link>
        </div>
      </nav>
    </>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

export const LandingFooter = () => (
  <footer className="footer">
    {/* Gold top line */}
    <div className="footer-line" />

    <div className="container">
      <div className="fgrid">

        {/* Brand column */}
        <div className="fcol-brand">
          {/* Logo */}
          <Link href="/" className="footer-logo">
            <img
              src="/logo.png"
              alt="QuranMentorGlobal"
              className="footer-logo-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div>
              <div className="fb-name">Quran <span>Mentor</span> Global</div>
              <div className="fb-tag">Learn · Connect · Grow Spiritually</div>
            </div>
          </Link>

          <p className="fb-desc">
            Connecting students with certified Qaris and teachers worldwide for a
            personalized, spiritual learning experience. For all ages, all levels,
            all backgrounds.
          </p>

          <div className="footer-contact-row">
            <a href="mailto:info@quranmentorglobal.com" className="footer-link-pill">
              📧 info@quranmentorglobal.com
            </a>
            <a href="https://wa.me/message/QuranMentorGlobal" target="_blank" rel="noopener noreferrer" className="footer-link-pill">
              💬 WhatsApp Support
            </a>
          </div>

          <SocialIcons dark />
        </div>

        {/* Quick Links */}
        <div className="fcol">
          <h4 className="fcol-hd">Platform</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/courses">Our Courses</Link></li>
            <li><Link href="/platform/teachers">Find a Teacher</Link></li>
            <li><Link href="/contact">How It Works</Link></li>
            <li><Link href="/auth/signup">Teach With Us</Link></li>
          </ul>
        </div>

        {/* Courses */}
        <div className="fcol">
          <h4 className="fcol-hd">Courses</h4>
          <ul>
            <li><Link href="/courses">Noorani Qaida</Link></li>
            <li><Link href="/courses">Tajweed Rules</Link></li>
            <li><Link href="/courses">Hifz Programme</Link></li>
            <li><Link href="/courses">Tafseer & Translation</Link></li>
            <li><Link href="/courses">Kids Classes</Link></li>
            <li><Link href="/courses">Ijazah Programme</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="fcol">
          <h4 className="fcol-hd">Legal</h4>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-of-service">Terms of Service</a></li>
            <li><a href="/cookie-policy">Cookie Policy</a></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><a href="mailto:info@quranmentorglobal.com">Email Us</a></li>
          </ul>
        </div>

      </div>

      {/* Ayah divider */}
      <div className="footer-ayah">
        <span className="fayah-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
        <span className="fayah-sep">·</span>
        <span className="fayah-en">"The best among you are those who learn the Quran and teach it."</span>
      </div>

      {/* Bottom bar */}
      <div className="fbot">
        <p>© 2025 Quran Mentor Global. All rights reserved. | www.QuranMentorGlobal.com</p>
        <div className="fbot-links">
          <a href="/privacy-policy">Privacy</a>
          <span>·</span>
          <a href="/terms-of-service">Terms</a>
          <span>·</span>
          <a href="/cookie-policy">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
)

// ── Shared CSS ────────────────────────────────────────────────────────────────

export const LANDING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Amiri:wght@400;700&display=swap');

  :root {
    --green:      #1B5E37;
    --green-dark: #0D3D20;
    --green-mid:  #2A7A4A;
    --gold:       #B8952A;
    --gold-light: #D4AF50;
    --gold-pale:  #F0E4B8;
    --cream:      #F5F0E8;
    --cream-d:    #EDE6D6;
    --td:         #1A1A1A;
    --tm:         #3D3D3D;
    --tl:         #6B6B6B;
    --ff: 'Playfair Display', Georgia, serif;
    --fb: 'DM Sans', system-ui, sans-serif;
    --fa: 'Amiri', serif;
    --r:  12px;
    --rl: 20px;
    --rx: 28px;
    --sh:  0 4px 24px rgba(0,0,0,.09);
    --shl: 0 12px 48px rgba(0,0,0,.16);
    --ease: cubic-bezier(.4,0,.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--fb); color: var(--td); background: #fff; overflow-x: hidden; line-height: 1.6; }
  img  { max-width: 100%; display: block; }
  a    { text-decoration: none; color: inherit; }
  ul   { list-style: none; }

  .container { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

  /* ── Buttons ── */
  .btn { display: inline-flex; align-items: center; gap: 8px; font-family: var(--fb); font-size: 15px; font-weight: 600; padding: 15px 32px; border-radius: 50px; border: none; cursor: pointer; transition: all .3s var(--ease); white-space: nowrap; }
  .btn-gold         { background: linear-gradient(135deg,var(--gold),var(--gold-light)); color: #fff; box-shadow: 0 4px 20px rgba(184,149,42,.3); }
  .btn-gold:hover   { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(184,149,42,.45); }
  .btn-green        { background: linear-gradient(135deg,var(--green),var(--green-mid)); color: #fff; box-shadow: 0 4px 20px rgba(27,94,55,.3); }
  .btn-green:hover  { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(27,94,55,.45); }
  .btn-outline-white { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.45); }
  .btn-outline-white:hover { background: rgba(255,255,255,.1); border-color: #fff; transform: translateY(-3px); }
  .btn-outline-green { background: transparent; color: var(--green); border: 2px solid var(--green); }
  .btn-outline-green:hover { background: var(--green); color: #fff; transform: translateY(-3px); }
  .btn-sm { padding: 9px 20px; font-size: 13px; }

  /* ── Typography helpers ── */
  .sl { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .sl::before, .sl::after { content: ''; flex: none; width: 26px; height: 1.5px; background: var(--gold); }
  .sl.center { justify-content: center; }
  .sl.wh  { color: var(--gold-light); }
  .sl.wh::before, .sl.wh::after { background: var(--gold-light); }
  .st { font-family: var(--ff); font-size: clamp(28px,4vw,46px); font-weight: 700; color: var(--green-dark); line-height: 1.18; margin-bottom: 18px; }
  .st span { color: var(--gold); }
  .ss { font-size: 17px; color: var(--tm); line-height: 1.78; max-width: 560px; }
  .section-hd { text-align: center; margin-bottom: 64px; }
  .section-hd .ss { margin: 0 auto; }



  /* ── Language dropdown ── */
  .lang-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,.06); border: 1px solid rgba(27,94,55,.15); color: var(--tm); font-family: var(--fb); font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 8px; cursor: pointer; transition: all .2s; white-space: nowrap; }
  .lang-btn:hover { background: rgba(27,94,55,.07); border-color: var(--green); color: var(--green); }
  .lang-menu { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid var(--cream-d); border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,.14); min-width: 160px; z-index: 300; overflow: hidden; }
  .lang-opt { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 14px; background: none; border: none; cursor: pointer; font-family: var(--fb); font-size: 14px; color: var(--td); transition: background .15s; text-align: left; gap: 12px; }
  .lang-opt:hover   { background: var(--cream); }
  .lang-opt.active  { background: rgba(27,94,55,.07); color: var(--green); font-weight: 600; }
  .lang-soon { font-size: 10px; color: var(--tl); padding: 8px 14px; border-top: 1px solid var(--cream-d); text-align: center; }

  /* ── Navbar ── */
  .nav { background: rgba(255,255,255,.97); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(27,94,55,.08); position: sticky; top: 0; z-index: 200; transition: all .4s var(--ease); }
  .nav.scrolled { box-shadow: 0 4px 32px rgba(0,0,0,.1); }
  .nav .container { display: flex; align-items: center; justify-content: space-between; height: 72px; }
  .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .logo-img { height: 46px; width: auto; border-radius: 8px; object-fit: contain; }
  .logo-txt .name { font-family: var(--ff); font-size: 17px; font-weight: 700; color: var(--green-dark); line-height: 1.1; }
  .logo-txt .name span { color: var(--gold); }
  .logo-txt .tag { font-size: 9px; color: var(--tl); letter-spacing: .1em; text-transform: uppercase; }
  .nav-links { display: flex; align-items: center; gap: 2px; }
  .nav-links a { font-size: 14px; font-weight: 500; color: var(--tm); padding: 8px 13px; border-radius: 8px; transition: all .22s; }
  .nav-links a:hover, .nav-links a.active { color: var(--green); background: rgba(27,94,55,.06); }
  .nav-cta { display: flex; gap: 10px; align-items: center; }

  /* Hamburger */
  .ham { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
  .ham span { width: 23px; height: 2px; background: var(--green-dark); border-radius: 2px; transition: all .3s; display: block; }
  .ham.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .ham.open span:nth-child(2) { opacity: 0; }
  .ham.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  /* Mobile menu */
  .mob-menu { display: none; position: fixed; top: 104px; left: 0; right: 0; background: #fff; border-bottom: 2px solid var(--green); padding: 16px 24px; flex-direction: column; gap: 4px; box-shadow: var(--shl); z-index: 199; }
  .mob-menu.open { display: flex; }
  .mob-menu a { font-size: 15px; font-weight: 500; padding: 11px 14px; border-radius: 10px; color: var(--tm); transition: all .2s; display: block; }
  .mob-menu a:hover, .mob-menu a.mob-active { background: var(--cream); color: var(--green); }
  .mob-divider { height: 1px; background: var(--cream-d); margin: 8px 0; }
  .mob-lang { padding: 6px 14px; }

  /* ── Page hero (used on About / Courses / Teachers / Contact) ── */
  .page-hero { position: relative; padding: 100px 0 80px; text-align: center; overflow: hidden; }
  /* Hero uses a local background image — each page sets its own via inline style */
  .page-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(13,61,32,.52) 0%, rgba(13,61,32,.35) 55%, rgba(13,61,32,.48) 100%); z-index: 0; }
  .page-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: -1; }
  .page-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; z-index: -1; display: block; }
  .page-hero > .container { position: relative; z-index: 1; }
  .page-hero h1 { font-family: var(--ff); font-size: clamp(32px,5vw,58px); font-weight: 800; color: #fff; line-height: 1.12; margin-bottom: 18px; text-shadow: 0 2px 16px rgba(0,0,0,.4); }
  .page-hero h1 span { color: var(--gold-light); }
  .page-hero p { font-size: 19px; color: rgba(255,255,255,.92); max-width: 540px; margin: 0 auto 32px; line-height: 1.72; font-weight: 500; text-shadow: 0 1px 8px rgba(0,0,0,.4); }
  .breadcrumb { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.45); margin-bottom: 20px; }
  .breadcrumb a { color: rgba(255,255,255,.6); transition: color .2s; }
  .breadcrumb a:hover { color: #fff; }
  .breadcrumb .sep { color: rgba(255,255,255,.25); }

  /* ── Hadith / Ayah section ── */
  .hadith { background: linear-gradient(140deg, var(--green) 0%, var(--green-dark) 100%); padding: 80px 0; text-align: center; }
  .hadith-ar  { font-family: var(--fa); font-size: clamp(22px,3.5vw,38px); color: var(--gold-light); margin-bottom: 16px; direction: rtl; }
  .hadith-en  { font-family: var(--ff); font-size: clamp(18px,2.8vw,28px); color: #fff; font-style: italic; margin-bottom: 10px; }
  .hadith-src { font-size: 13px; color: rgba(255,255,255,.42); }

  /* ── Contact info items ── */
  .ci { display: flex; align-items: flex-start; gap: 15px; padding: 12px; border-radius: 12px; transition: background .2s; }
  .ci:hover { background: var(--cream); }
  .ci-ico { width: 44px; height: 44px; border-radius: 13px; background: linear-gradient(135deg,var(--green),var(--green-mid)); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; }
  .ci-b h4 { font-size: 14px; font-weight: 600; color: var(--green-dark); margin-bottom: 2px; }
  .ci-b p  { font-size: 13px; color: var(--tl); }

  /* ── Form elements ── */
  .fg { margin-bottom: 16px; }
  .fg label { display: block; font-size: 13px; font-weight: 600; color: var(--tm); margin-bottom: 6px; }
  .fg input, .fg select, .fg textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #E0DDD5; border-radius: 10px; font-family: var(--fb); font-size: 14px; color: var(--td); background: #fff; transition: all .25s; outline: none; }
  .fg input:focus, .fg select:focus, .fg textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(27,94,55,.1); }
  .fg textarea { min-height: 108px; resize: vertical; }
  .fg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* ── Footer ── */
  .footer { background: var(--green-dark); padding: 64px 0 0; position: relative; overflow: hidden; }
  .footer-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .fgrid { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
  .fcol-brand {}
  .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .footer-logo-img { height: 38px; width: auto; border-radius: 6px; object-fit: contain; }
  .fb-name { font-family: var(--ff); font-size: 18px; font-weight: 700; color: #fff; line-height: 1.1; }
  .fb-name span { color: var(--gold); }
  .fb-tag { font-size: 9px; color: rgba(255,255,255,.3); letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }
  .fb-desc { font-size: 13px; color: rgba(255,255,255,.45); line-height: 1.8; margin-bottom: 16px; }
  .footer-contact-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .footer-link-pill { font-size: 12px; color: rgba(255,255,255,.5); transition: color .2s; display: inline-flex; align-items: center; gap: 6px; }
  .footer-link-pill:hover { color: var(--gold-light); }
  .fcol h4, .fcol-hd { font-size: 11px; font-weight: 700; color: var(--gold-light); text-transform: uppercase; letter-spacing: .12em; margin-bottom: 16px; }
  .fcol ul { display: flex; flex-direction: column; gap: 10px; }
  .fcol ul li a { font-size: 13px; color: rgba(255,255,255,.45); transition: all .2s; display: inline-block; }
  .fcol ul li a:hover { color: var(--gold-light); transform: translateX(4px); }
  .soc-icon:hover { background: var(--gold) !important; color: #fff !important; border-color: var(--gold) !important; transform: translateY(-3px) scale(1.08); }

  /* Footer ayah */
  .footer-ayah { display: flex; align-items: center; gap: 14px; border-top: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.07); padding: 16px 0; margin-bottom: 20px; flex-wrap: wrap; }
  .fayah-ar  { font-family: var(--fa); font-size: 16px; color: var(--gold-light); direction: rtl; flex-shrink: 0; }
  .fayah-sep { color: rgba(255,255,255,.2); }
  .fayah-en  { font-size: 12px; color: rgba(255,255,255,.35); font-style: italic; }

  /* Footer bottom */
  .fbot { padding: 16px 0 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .fbot p { font-size: 12px; color: rgba(255,255,255,.25); }
  .fbot-links { display: flex; gap: 10px; align-items: center; font-size: 12px; color: rgba(255,255,255,.35); }
  .fbot-links a { color: rgba(255,255,255,.35); transition: color .2s; }
  .fbot-links a:hover { color: var(--gold-light); }
  .fbot-links span { opacity: .4; }

  /* ── Scroll-to-top button ── */
  #stbtn { position: fixed; bottom: 28px; right: 28px; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg,var(--green),var(--green-mid)); color: #fff; border: none; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 200; opacity: 0; transition: all .4s; box-shadow: 0 4px 20px rgba(27,94,55,.4); }
  #stbtn:hover { transform: translateY(-4px) scale(1.05); }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .fgrid { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 900px) {
    .nav-links, .nav-cta { display: none; }
    .ham { display: flex; }
  }
  @media (max-width: 768px) {
    .nav-links, .nav-cta { display: none !important; }
    .ham { display: flex !important; }
    .fgrid { grid-template-columns: 1fr; gap: 28px; }
    .fg-row { grid-template-columns: 1fr; }
    .footer-ayah { flex-direction: column; gap: 8px; }
  }
  @media (max-width: 480px) {
    .fgrid { grid-template-columns: 1fr; }
  }
`
