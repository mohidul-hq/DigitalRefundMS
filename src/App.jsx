import React from 'react';
// Tailwind is imported via src/index.css in main.jsx
import RefundDashboard from './RefundDashboard.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import { useAuth } from './components/AuthProvider.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-root flex items-center justify-center">
        <div className="text-slate-300">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login />
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
