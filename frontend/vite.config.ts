
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';


// LOCAL DEV: Use HTTPS only if certs exist, else fallback to HTTP
// PRODUCTION (Vercel): This config is ignored, Vercel handles SSL automatically
const keyPath = process.env.HTTPS_KEY || path.resolve(__dirname, 'key.pem');
const certPath = process.env.HTTPS_CERT || path.resolve(__dirname, 'cert.pem');

const httpsConfig = fs.existsSync(keyPath) && fs.existsSync(certPath)
  ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    }
  : undefined; // undefined = HTTP (for local dev)

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.webp', 'robots.txt'],
      manifest: require('./pwa-manifest.json'),
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.+\.(?:png|jpg|jpeg|svg|webp|ico)$/, // cache images
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/.+\.(?:js|css)$/, // cache static assets
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    })
  ],
  optimizeDeps: { exclude: ['lucide-react'] },
  server: {
    // For local dev: HTTPS if certs exist, else HTTP
    https: httpsConfig,
    port: 5173,
  },
});

// NOTE:
// - For local dev, you can use HTTPS by placing key.pem/cert.pem in the project root.
// - For production (Vercel), this config is ignored. Vercel provides HTTPS automatically.
// - Your API (FastAPI) on Render should also use HTTP internally; Render/Cloud will handle SSL termination.
