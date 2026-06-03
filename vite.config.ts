import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      allowedHosts: ['localhost', 'moneybags-scribble-urgency.ngrok-free.dev'],
      proxy: {
        '/api/chat': {
          target: 'https://openrouter.ai/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/chat/, '/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY
              if (key) {
                proxyReq.setHeader('Authorization', `Bearer ${key}`)
              }
              proxyReq.setHeader('HTTP-Referer', 'https://gifted.com')
              proxyReq.setHeader('X-Title', 'Gifted Portfolio')
            })
          },
        },
        '/api/cloudinary': {
          target: `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME || ''}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cloudinary/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.CLOUDINARY_API_KEY
              const secret = env.CLOUDINARY_API_SECRET
              if (key && secret) {
                const auth = Buffer.from(`${key}:${secret}`).toString('base64')
                proxyReq.setHeader('Authorization', `Basic ${auth}`)
              }
            })
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
