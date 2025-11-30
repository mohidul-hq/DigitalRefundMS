/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { account } from '../lib/appwriteClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const idleTimer = useRef(null)
  const warnTimer = useRef(null)
  const warningRef = useRef(null)
  const [idleWarning, setIdleWarning] = useState(false)
  const idleWarningRef = useRef(false)
  const [idleCountdown, setIdleCountdown] = useState(60) // seconds to decide

  // Config: 2 hours of inactivity triggers warning, then 60s before auto logout
  const IDLE_MS = Number(import.meta.env.VITE_IDLE_MS ?? 2 * 60 * 60 * 1000)
  const WARN_SECONDS = Number(import.meta.env.VITE_WARN_SECONDS ?? 60)

  const fetchUser = useCallback(async () => {
    try {
      const u = await account.get()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Handle OAuth callback path; after Google redirects back
    const path = window.location.pathname
    if (path === '/oauth' || path === '/auth' || path === '/auth/oauth') {
      fetchUser().then(() => {
        // replace history to root so app renders main UI
        window.history.replaceState(null, '', '/')
      })
    } else {
      fetchUser()
    }
  }, [fetchUser])

  // Inactivity detection
  const clearIdleTimers = useCallback(() => {
    if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null }
    if (warnTimer.current) { clearInterval(warnTimer.current); warnTimer.current = null }
    setIdleWarning(false)
    setIdleCountdown(WARN_SECONDS)
  }, [])

  const startIdleTimer = useCallback(() => {
    clearIdleTimers()
    idleTimer.current = setTimeout(() => {
      // show warning and start countdown
      setIdleWarning(true)
      setIdleCountdown(WARN_SECONDS)
      warnTimer.current = setInterval(() => {
        setIdleCountdown((s) => {
          if (s <= 1) {
            // time's up → logout
            clearIdleTimers()
            logout()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, IDLE_MS)
  }, [clearIdleTimers])

  // User activity resets idle timer
  useEffect(() => {
    // Only track inactivity when a user is authenticated
    if (!user) {
      clearIdleTimers()
      return
    }
    const onActivity = () => {
      // Do not auto-dismiss the warning via mouse/keys; buttons must be used
      if (idleWarningRef.current) return
      startIdleTimer()
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    startIdleTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity))
    }
  }, [user, startIdleTimer, clearIdleTimers])

  // Keep a ref in sync so onActivity sees the latest value without re-subscribing
  useEffect(() => {
    idleWarningRef.current = idleWarning
  }, [idleWarning])

  // Clear timers on unmount to avoid leaks
  useEffect(() => () => clearIdleTimers(), [clearIdleTimers])

  // Provide a stable helper to keep the user logged in (used by UI and auto-cancel)
  const stayLoggedIn = useCallback(() => {
    clearIdleTimers()
    startIdleTimer()
  }, [clearIdleTimers, startIdleTimer])

  // Auto-cancel via keyboard/mouse is disabled by request; user must choose a button.

  const register = async (email, password, name) => {
    setError(null)
    try {
      const newUser = await account.create('unique()', email, password, name)
      // auto login after registration
      await account.createEmailSession(email, password)
      await fetchUser()
      return newUser
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      await account.createEmailSession(email, password)
      await fetchUser()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const loginWithGoogle = () => {
    // Redirect-based OAuth flow. Ensure redirect URL is whitelisted in Appwrite console.
    const success = window.location.origin + '/oauth'
    const failure = window.location.origin + '/login'
    account.createOAuth2Session('google', success, failure)
  }

  const logout = async () => {
    try {
      await account.deleteSessions()
    } catch {
      // ignore
    }
    setUser(null)
    clearIdleTimers()
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    stayLoggedIn,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user && idleWarning && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" aria-hidden="true" />
          <div ref={warningRef} className="relative z-20 pointer-events-auto mx-4 sm:mx-0 w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 shadow-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-100">Are you still there?</h2>
                <p className="text-sm text-slate-400">You’ve been inactive for a while. You’ll be logged out in <span className="font-medium text-emerald-400">{idleCountdown}s</span>. Use the options below to continue.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={logout} className="secondary-btn">Log out now</button>
              <button type="button" onClick={stayLoggedIn} className="primary-btn">Stay logged in</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
