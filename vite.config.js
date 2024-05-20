import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vt_youtube/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
