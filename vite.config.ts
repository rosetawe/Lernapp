import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Lernapp/', // exakt der Repo-Name mit Slash vorne und hinten!
})