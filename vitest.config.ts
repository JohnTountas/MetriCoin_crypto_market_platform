import { fileURLToPath, URL } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup/vitest.setup.ts'],
    css: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
