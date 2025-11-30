import React, { useEffect, useState } from 'react';
// Tailwind is imported via src/index.css in main.jsx
import RefundDashboard from './RefundDashboard.jsx';
import Login, { getSession, clearSession } from './Login.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = getSession();
    setSession(s);
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    // Notify AuthProvider listeners
    try { window.dispatchEvent(new Event('session-changed')); } catch {}
  };

  if (!session) {
    return (
      <div className="app-root">
        <Login onLogin={(s) => setSession(s)} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Navbar onToggleSidebar={() => {}} />
      <div className="mt-4" />
      <RefundDashboard />
    </div>
  );
}

export default App;
