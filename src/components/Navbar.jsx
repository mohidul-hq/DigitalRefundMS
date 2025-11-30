import { useAuth } from './AuthProvider'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  return (
	<header className="sticky top-0 z-40 transition-colors duration-300 bg-slate-950/80 border-b border-white/10 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="lg:hidden p-2 rounded-md hover:bg-white/10" onClick={onToggleSidebar} aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-200"><path fillRule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clipRule="evenodd"/></svg>
          </button>
          <span className="font-semibold text-lg text-slate-100 transition-colors">Refund Manager</span>
          {/* External apps on the left */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            <a
              href="https://mohidul-hq.github.io/DigitalRefundMS/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-slate-100 hover:bg-white/20 hover:border-white/30 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-1.5 text-sm hover:scale-[1.02]"
            >
              Refund MS
            </a>
            <a
              href="https://mohidul-hq.github.io/DigitalSevaService_Invoice/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-slate-100 hover:bg-white/20 hover:border-white/30 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-1.5 text-sm hover:scale-[1.02]"
            >
              Invoice
            </a>
            <a
              href="https://mohidul-hq.github.io/Deposit-MS/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border border-white/10 bg-white/10 backdrop-blur-md text-slate-100 hover:bg-white/20 hover:border-white/30 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-1.5 text-sm hover:scale-[1.02]"
            >
              Deposit MS
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shadow">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm text-slate-300 max-w-40 truncate" title={user.email}>{user.email}</span>
            </div>
          )}
          <button className="p-2 rounded-md hover:bg-white/10" title="Logout" onClick={logout}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-slate-300"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
          </button>
          {/* Theme toggle removed as requested */}
        </div>
      </div>
      <div className="h-1 bg-linear-to-r from-blue-500 via-sky-400 to-cyan-500" />
    </header>
  )
}
