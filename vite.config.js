import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const apiProxy = {
  '/api': {
    target: 'http://localhost:4001',
    changeOrigin: true,
  },
  '/sitemap.xml': {
    target: 'http://localhost:4001',
    changeOrigin: true,
    rewrite: () => '/api/sitemap.xml',
  },
  '/robots.txt': {
    target: 'http://localhost:4001',
    changeOrigin: true,
    rewrite: () => '/api/robots.txt',
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
})
