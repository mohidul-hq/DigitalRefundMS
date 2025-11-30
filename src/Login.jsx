import React, { useState } from 'react'

export function getSession() {
  try {
    const raw = localStorage.getItem('session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  try { localStorage.removeItem('session') } catch {}
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const session = { email }
    try { localStorage.setItem('session', JSON.stringify(session)) } catch {}
    onLogin?.(session)
  }

  return (
    <div className="w-full max-w-sm mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Sign in</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter your email to continue</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="primary-btn w-full justify-center">Continue</button>
      </form>
    </div>
  )
}
