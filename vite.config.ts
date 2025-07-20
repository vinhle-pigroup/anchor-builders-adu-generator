import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5000, // Assigned port range 5000-5099
    host: true, // Allow external connections
  },
  preview: {
    host: true,
    port: 5000,
    allowedHosts: ['anchor-builders-adu-generator-production.up.railway.app'],
  },
});
