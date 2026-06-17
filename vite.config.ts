import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the project under /wc_stickers/; local dev stays at /.
  base: process.env.GITHUB_ACTIONS ? '/wc_stickers/' : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
})
