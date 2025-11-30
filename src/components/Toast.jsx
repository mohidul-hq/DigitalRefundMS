import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])

  const push = useCallback((message, opts = {}) => {
    const id = crypto.randomUUID()
    const toast = { id, message, type: opts.type || 'success', duration: opts.duration || 2500 }
    setToasts((ts) => [...ts, toast])
    setTimeout(() => remove(id), toast.duration)
  }, [remove])

  const value = useMemo(() => ({ push, remove }), [push, remove])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-lg shadow-md text-white ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
