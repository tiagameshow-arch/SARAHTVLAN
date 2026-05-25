import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Isto força o Vite a buscar os arquivos usando caminhos relativos (./)
  // em vez de caminhos absolutos (/) que quebram no Vercel.
  base: './', 
})
