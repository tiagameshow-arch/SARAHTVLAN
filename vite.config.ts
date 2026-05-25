import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // O ponto garante que os caminhos sejam relativos
  build: {
    outDir: 'dist' // Garante que a pasta de saída é a correta
  }
})
