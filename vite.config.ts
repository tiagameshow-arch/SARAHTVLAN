import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // A linha abaixo é o segredo para o GitHub Pages funcionar:
  base: '/SARAHTVLAN/', 
})
