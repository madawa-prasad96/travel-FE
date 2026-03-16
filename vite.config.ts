import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    allowedHosts:['fa8b-2402-4000-2101-7b7-6548-48db-eac0-e941.ngrok-free.app']
  }
})
