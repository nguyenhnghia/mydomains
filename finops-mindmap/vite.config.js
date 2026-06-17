import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // relative base => dist/ is self-contained, works on file:// and any subpath
  base: './',
  plugins: [react(), tailwindcss()],
});
