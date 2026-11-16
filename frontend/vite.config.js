import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // clasele din *.module.css se pot scrie și ca styles.addBtn (pentru .add-btn)
  css: { modules: { localsConvention: 'camelCase' } },
})
