import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Isto é obrigatório para o Vercel não se perder nas pastas
  base: './', 
})
