import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Tailwind entry (base, components, utilities)
import './index.css';
// Keep existing app styles (dashboard, table, etc.)
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
