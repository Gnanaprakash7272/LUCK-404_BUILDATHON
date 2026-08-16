import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── SVG Eye Icons from campus-portal-login.html ──────────────────────────────
const EyeOnIcon = () => (
  <svg className="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 18, height: 18 }}>
    <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/>
    <circle cx="12" cy="12" r="3.2"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg className="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 18, height: 18 }}>
    <path d="M3 3l18 18"/>
    <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.6 13.6 0 0 1-3.1 3.9M6.6 6.6C3.4 8.5 1.5 12 1.5 12S5 19 12 19a9.9 9.9 0 0 0 5.4-1.6"/>
    <path d="M9.9 10a3.2 3.2 0 0 0 4.2 4.2"/>
  </svg>
)

// ─── Portal URLs ─────────────────────────────────────────────────────────────
const STAFF_URL  = 'http://localhost:5174'
const ADMIN_URL  = 'http://localhost:5175'

function resolveDestination(role) {
  const r = (role || '').toLowerCase()
  if (r === 'teacher' || r === 'staff' || r === 'faculty') return { type: 'external', url: STAFF_URL }
  if (r === 'admin' || r === 'administrator')               return { type: 'external', url: `${ADMIN_URL}/admin/dashboard` }
  if (r === 'student')                                       return { type: 'internal', path: '/dashboard' }
  return null
}

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [welcome, setWelcome] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    try {
      const data = await login(email.trim(), password)
      const user = data?.user
      if (!user) throw new Error('Invalid response from server.')

      // Handle session persistence
      if (!remember) {
        const token = localStorage.getItem('auth_token')
        const usr = localStorage.getItem('auth_user')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        sessionStorage.setItem('auth_token', token || '')
        sessionStorage.setItem('auth_user', usr || '')
      }

      const dest = resolveDestination(user.role)
      if (!dest) {
        setError(`Your account role ("${user.role}") could not be verified. Please contact the administrator.`)
        setLoading(false)
        return
      }

      setWelcome(`Welcome back, ${user.name || user.email}`)
      setLoading(false)

      setTimeout(() => {
        if (dest.type === 'internal') {
          const destination = location.state?.from?.pathname || dest.path
          navigate(destination, { replace: true })
        } else {
          // Cross-origin redirect: pass token + user via URL so the target
          // portal can write them to its own localStorage (different origin).
          const token = localStorage.getItem('auth_token') || ''
          const usr   = localStorage.getItem('auth_user') || ''
          const url   = new URL(dest.url)
          url.searchParams.set('_ap_token', token)
          url.searchParams.set('_ap_user',  usr)
          window.location.href = url.toString()
        }
      }, 900)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || ''
      if (!msg || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connect')) {
        setError('Unable to connect to Academic Pulse. Please try again.')
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('incorrect')) {
        setError('Invalid email or password.')
      } else {
        setError(msg || 'Unable to sign in. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        :root {
          --ink: #14140f;
          --ink-2: #1c1a13;
          --gold: #e8b430;
          --gold-soft: #f3d375;
          --maroon: #8c1f2b;
          --paper: #f7f3e8;
          --paper-dim: #c9c3b2;
          --radius: 20px;
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          margin: 0;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--paper);
          background: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .page {
          position: relative;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }

        .hero-media {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: var(--ink);
        }

        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 38%;
          display: block;
        }

        .scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(122deg, rgba(18, 17, 12, .10) 0%, rgba(18, 17, 12, .28) 34%, rgba(18, 17, 12, .62) 58%, rgba(18, 17, 12, .88) 100%),
            linear-gradient(to top, rgba(10, 10, 7, .5) 0%, rgba(10, 10, 7, 0) 32%);
        }

        .topbar {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          padding: 30px 36px;
        }

        .brandmark {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brandmark .mark {
          flex: none;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--gold), var(--maroon));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: .02em;
          color: var(--ink);
        }

        .brandmark .name {
          line-height: 1.35;
        }

        .brandmark .name .l1 {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--paper);
        }

        .brandmark .name .l2 {
          display: block;
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--paper-dim);
        }

        .panel-wrap {
          position: relative;
          z-index: 2;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 36px;
        }

        .card {
          position: relative;
          width: min(420px, 100%);
          background: rgba(20, 19, 15, .58);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border: 1px solid rgba(247, 243, 232, .14);
          border-radius: var(--radius);
          padding: 38px 34px 30px;
          box-shadow: 0 30px 70px -25px rgba(0, 0, 0, .65);
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 26px;
          right: 26px;
          height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-soft) 45%, var(--maroon) 100%);
          border-radius: 0 0 3px 3px;
          transform-origin: left center;
          transform: scaleX(0);
          animation: draw-in .9s cubic-bezier(.16, 1, .3, 1) .25s forwards;
        }

        @keyframes draw-in {
          to {
            transform: scaleX(1);
          }
        }

        .reveal {
          opacity: 0;
          transform: translateY(10px);
          animation: reveal-in .6s cubic-bezier(.16, 1, .3, 1) forwards;
          animation-delay: calc(var(--d, 0) * 70ms + 420ms);
        }

        @keyframes reveal-in {
          to {
            opacity: 1;
            transform: none;
          }
        }

        .card h1 {
          margin: 0 0 6px;
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 30px;
          letter-spacing: -.01em;
          color: var(--paper);
        }

        .card h1 em {
          font-style: italic;
          font-weight: 500;
          color: var(--gold-soft);
        }

        .card .subhead {
          margin: 0 0 26px;
          font-size: 14px;
          line-height: 1.55;
          color: var(--paper-dim);
          max-width: 34ch;
        }

        .field {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: .09em;
          text-transform: uppercase;
          color: var(--paper-dim);
        }

        .field input {
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: var(--paper);
          background: rgba(247, 243, 232, .06);
          border: 1px solid rgba(247, 243, 232, .18);
          border-radius: 11px;
          padding: 12px 14px;
          transition: border-color .2s ease, background .2s ease;
          outline: none;
        }

        .field input::placeholder {
          color: rgba(201, 195, 178, .48);
        }

        .field input:hover {
          border-color: rgba(247, 243, 232, .32);
        }

        .field input:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 1px;
          border-color: var(--gold);
        }

        .pw-wrap {
          position: relative;
        }

        .pw-wrap input {
          padding-right: 44px;
        }

        .pw-toggle {
          position: absolute;
          top: 50%;
          right: 6px;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 0;
          border-radius: 8px;
          color: var(--paper-dim);
          cursor: pointer;
        }

        .pw-toggle:hover {
          color: var(--paper);
          background: rgba(247, 243, 232, .08);
        }

        .pw-toggle:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 1px;
        }

        .pw-toggle svg {
          width: 18px;
          height: 18px;
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 6px 0 22px;
          font-size: 13px;
        }

        .remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--paper-dim);
          cursor: pointer;
        }

        .remember input {
          width: 15px;
          height: 15px;
          accent-color: var(--gold);
          cursor: pointer;
        }

        .forgot-link {
          color: var(--paper-dim);
          text-decoration: underline;
          text-decoration-color: rgba(201, 195, 178, .4);
          text-underline-offset: 3px;
          font-size: 13px;
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .forgot-link:hover {
          color: var(--paper);
          text-decoration-color: var(--gold);
        }

        .forgot-link:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 3px;
        }

        .btn-primary {
          width: 100%;
          padding: 14px 0;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, var(--gold), var(--gold-soft));
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: .01em;
          cursor: pointer;
          box-shadow: 0 14px 28px -10px rgba(232, 180, 48, .55);
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px -10px rgba(232, 180, 48, .7);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-primary:focus-visible {
          outline: 2px solid var(--paper);
          outline-offset: 3px;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-note {
          min-height: 18px;
          margin: 14px 2px 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--gold-soft);
        }

        .form-note.error-state {
          color: #ff8888;
        }

        .help-line {
          margin: 18px 0 0;
          padding-top: 16px;
          border-top: 1px solid rgba(247, 243, 232, .12);
          font-size: 12.5px;
          color: var(--paper-dim);
        }

        .help-line b {
          color: var(--paper);
          font-weight: 600;
        }

        .foot {
          position: relative;
          z-index: 2;
          flex: 0 0 auto;
          padding: 18px 36px 22px;
          font-size: 12px;
          color: var(--paper-dim);
        }

        @media (prefers-reduced-motion: reduce) {
          .card::before {
            animation: none;
            transform: scaleX(1);
          }
          .reveal {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .btn-primary:hover {
            transform: none;
          }
        }

        @media (max-width: 720px) {
          .hero-media {
            position: relative;
            inset: auto;
            order: 2;
            height: 34vh;
            min-height: 210px;
            max-height: 320px;
            border-radius: 0 0 26px 26px;
            overflow: hidden;
          }

          .bg-video {
            object-position: center 42%;
          }

          .scrim {
            background: linear-gradient(to top, rgba(18, 17, 12, .9) 0%, rgba(18, 17, 12, 0) 55%);
          }

          .topbar {
            order: 1;
            padding: 20px 22px;
          }

          .brandmark .name {
            display: block;
          }

          .panel-wrap {
            order: 3;
            justify-content: center;
            align-items: flex-start;
            padding: 26px 20px 6px;
            background: var(--ink);
          }

          .card {
            width: 100%;
            padding: 32px 24px 26px;
          }

          .foot {
            order: 4;
            text-align: center;
            background: var(--ink);
            padding: 6px 20px 26px;
          }
        }

        @media (max-width: 380px) {
          .card h1 {
            font-size: 26px;
          }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="page">
        {/* Cinematic Video Background */}
        <div className="hero-media">
          <video className="bg-video" autoPlay muted loop playsInline poster="/login-poster.jpg">
            <source src="/login-bg.mp4" type="video/mp4" />
          </video>
          <div className="scrim"></div>
        </div>

        {/* Institution Brand Header */}
        <header className="topbar">
          <a href="#" className="brandmark">
            <div className="mark">K</div>
            <div className="name">
              <span className="l1">KalaignarKarunanidhi</span>
              <span className="l2">Institute of Technology</span>
            </div>
          </a>
        </header>

        {/* Scoped Glassmorphism Login Panel */}
        <main className="panel-wrap">
          <section className="card" aria-labelledby="portalHeading">
            <h1 id="portalHeading" className="reveal" style={{ '--d': 1 }}>
              Campus <em>Portal</em>
            </h1>
            <p className="subhead reveal" style={{ '--d': 2 }}>
              Sign in with your email and password to reach attendance, results and circulars.
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Centralized Email Input */}
              <div className="field reveal" style={{ '--d': 3 }}>
                <label htmlFor="idInput">Email Address</label>
                <input
                  type="email"
                  id="idInput"
                  name="email"
                  autoComplete="username"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading || welcome}
                  required
                />
              </div>

              {/* Password Input with Toggle */}
              <div className="field reveal" style={{ '--d': 4 }}>
                <label htmlFor="pwInput">Password</label>
                <div className="cp-pw-wrap pw-wrap">
                  <input
                    type={showPw ? 'text' : 'password'}
                    id="pwInput"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    disabled={loading || welcome}
                    required
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                  >
                    {showPw ? <EyeOffIcon /> : <EyeOnIcon />}
                  </button>
                </div>
              </div>

              {/* Row options */}
              <div className="row reveal" style={{ '--d': 5 }}>
                <label className="remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    disabled={loading || welcome}
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => setError('Contact the IT helpdesk to reset your password.')}
                  disabled={loading || welcome}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary reveal"
                style={{ '--d': 6 }}
                disabled={loading || welcome}
              >
                {loading ? 'Signing in…' : welcome ? 'Redirecting…' : 'Sign in'}
              </button>

              {/* Dynamic Status / Error Messages */}
              {welcome && (
                <p className="form-note" role="status" aria-live="polite">
                  {welcome}
                </p>
              )}
              {error && !welcome && (
                <p className="form-note error-state" role="status" aria-live="polite">
                  {error}
                </p>
              )}
            </form>

            <p className="help-line reveal" style={{ '--d': 7 }}>
              Trouble signing in? Contact the <b>IT helpdesk</b>.
            </p>
          </section>
        </main>

        <footer className="foot">
          © 2026 Kalaignar Karunanidhi Institute Of Technology
        </footer>
      </div>
    </>
  )
}