import React from 'react';
import './App.css';
import RefundDashboard from './RefundDashboard.jsx';

function App() {
  // Temporary: render dashboard directly. Auth UI/components can be wired later.
  return (
    <div className="app-root">
      <RefundDashboard />
    </div>
  );
}

export default App;
