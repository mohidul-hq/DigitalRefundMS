import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

// For GitHub Pages, the site is served from /<repo>/
// Set base to the repository name so assets resolve correctly.
const base = '/DigitalRefundMS/';

export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: { port: 5173, open: true },
  base,
});
