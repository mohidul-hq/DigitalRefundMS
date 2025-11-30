import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthProvider'

export default function Login() {
  const { login, register, loginWithGoogle, error } = useAuth()
  const [mode, setMode] = useState('login') // or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [success, setSuccess] = useState(false)
  const containerRef = useRef(null)
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 })

  // Track mouse position to drive dynamic effects
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setCursor({ x, y })
      // Update CSS variables for gradient center and parallax
      el.style.setProperty('--mx', `${x}`)
      el.style.setProperty('--my', `${y}`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setLocalError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      // Trigger success portal animation
      setSuccess(true)
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={containerRef} className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-black px-4 overflow-hidden cursor-gradient">
      {/* Ambient animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-sky-400/50 to-cyan-300/40 blur-3xl animate-float-slow parallax" style={{ transform: `translate3d(${(cursor.x-0.5)*18}px, ${(cursor.y-0.5)*18}px, 0)` }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-fuchsia-400/50 to-indigo-300/40 blur-3xl animate-float-slower parallax" style={{ transform: `translate3d(${(cursor.x-0.5)*-20}px, ${(cursor.y-0.5)*-20}px, 0)` }} />
      {/* Card */}
      <div className="relative z-10 w-full max-w-md space-y-6 bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/40 dark:border-white/10 animate-rise-in card-glow" style={{ boxShadow: `0 10px 30px -10px rgba(56, 189, 248, ${0.15 + (cursor.x+cursor.y)/12})` }}>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Access the Refund Manager</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="name">Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 shadow-input transition-transform hover:scale-[1.01]" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 shadow-input transition-transform hover:scale-[1.01]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 shadow-input transition-transform hover:scale-[1.01]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/20 cursor-pointer"
              >
                {/* Eye icon */}
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.98 8.223C5.62 6.319 8.58 3.75 12 3.75c3.42 0 6.38 2.569 8.02 4.473.96 1.128.96 3.426 0 4.554-1.64 1.904-4.6 4.473-8.02 4.473-3.42 0-6.38-2.569-8.02-4.473-.96-1.128-.96-3.426 0-4.554z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3l18 18M10.584 5.207A8.41 8.41 0 0112 5c3.42 0 6.38 2.569 8.02 4.473.96 1.128.96 3.426 0 4.554-.403.468-.884.96-1.43 1.457M6.88 6.88C5.614 7.877 4.57 8.933 3.98 9.777c-.96 1.128-.96 3.426 0 4.554C5.62 16.235 8.58 18.804 12 18.804c1.02 0 2.008-.186 2.94-.53M9 12a3 3 0 104.243 2.121"/></svg>
                )}
              </button>
            </div>
          </div>
          {(error || localError) && (
            <div className="text-sm text-red-600 dark:text-red-400">{error || localError}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full relative overflow-hidden inline-flex justify-center items-center gap-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium transition-all shadow-button cursor-pointer"
          >
            <span className="relative z-10">{submitting ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Register')}</span>
            <span className="pointer-events-none absolute inset-0 cursor-shine" />
          </button>
        </form>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>
  <button onClick={loginWithGoogle} className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur-md hover:bg-white/90 dark:hover:bg-white/20 text-gray-700 dark:text-gray-100 px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.21 3.61l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.05 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.14-3.08-.39-4.55H24v9.02h12.92c-.56 2.99-2.25 5.53-4.79 7.22l7.73 6c4.51-4.17 7.12-10.32 7.12-17.69z"/><path fill="#FBBC05" d="M10.54 28.41A14.5 14.5 0 019.5 24c0-1.53.26-3.01.73-4.41l-7.98-6.19A23.915 23.915 0 000 24c0 3.86.9 7.51 2.47 10.75l8.07-6.34z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.79l-7.73-6c-2.15 1.36-4.92 2.16-8.18 2.16-6.26 0-11.57-3.55-14.46-8.72l-8.07 6.34C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          <span>Continue with Google</span>
        </button>
        <div className="text-center text-sm">
          {mode === 'login' ? (
            <button onClick={() => setMode('register')} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Need an account? Register</button>
          ) : (
            <button onClick={() => setMode('login')} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Have an account? Sign in</button>
          )}
        </div>
      </div>
      {/* Success portal animation overlay */}
      {success && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative">
            <div className="portal-ring" />
            <div className="portal-ring delay-150" />
            <div className="portal-core" />
            {/* Ripple bursts */}
            <div className="success-ripple" />
            <div className="success-ripple delay-200" />
          </div>
        </div>
      )}
      {/* Cursor spotlight light effect */}
      <div className="pointer-events-none absolute inset-0 z-0 cursor-spotlight" />
    </div>
  )
}
