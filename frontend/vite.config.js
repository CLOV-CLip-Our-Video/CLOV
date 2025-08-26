import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const now = new Date();
const buildId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['clov.svg'],
      manifest: {
        name: 'CLOV',
        short_name: 'CLOV',
        description: 'CLip Our Video - 실시간 온라인 포토부스 서비스',
        theme_color: '#ffd966',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/clov.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        categories: ['photo', 'video', 'entertainment'],
        lang: 'ko'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB로 증가
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  define: {
    __BUILD_ID__: JSON.stringify(buildId), // 빌드 시점 고정
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
