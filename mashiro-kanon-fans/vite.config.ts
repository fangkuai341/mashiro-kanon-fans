import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),    tailwindcss()],
  css: {
    devSourcemap: true, // Make sure this is explicitly set to true or false
  },
  server: {
    port: 8888,
  },
})
