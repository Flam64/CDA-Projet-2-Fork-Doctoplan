import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/vitest.setup.ts'],
    exclude: [
      'node_modules',
      'dist',
      '**/e2e/**', // ⛔ exclut tous les tests e2e
      '**/playwright/**',
      '**/playwright.config.*',
    ],
  },
});
