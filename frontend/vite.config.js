import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(__dirname, '../backend/ssl/server.key');
const certPath = path.resolve(__dirname, '../backend/ssl/server.cert');
const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 443,
    host: '0.0.0.0',
    allowedHosts: ['vogcompanylimited.paint.com'],
    https: hasCerts ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    } : false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons', 'react-hot-toast'],
        }
      }
    }
  }
}));
