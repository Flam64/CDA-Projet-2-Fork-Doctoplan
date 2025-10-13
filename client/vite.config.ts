import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@daypilot/daypilot-lite-react': path.resolve(
        __dirname,
        'node_modules/@daypilot/daypilot-lite-react',
      ),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    host: '0.0.0.0',
    allowedHosts: ['odyssey.remote-cda4.wilders.dev', 'localhost'],
    hmr: {
      clientPort: 5173,
      port: 5173,
    },
  },
});
