import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // O ponto abaixo diz: "procure os arquivos na mesma pasta onde estou"
  base: './', 
})
