import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const vendorChunkGroups: Record<string, string[]> = {
  'chart-vendor': ['lightweight-charts'],
  'form-vendor': ['@hookform/resolvers', 'react-hook-form', 'zod'],
};

const resolveVendorChunk = (id: string) => {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  for (const [chunkName, packages] of Object.entries(vendorChunkGroups)) {
    if (
      packages.some(
        (packageName) =>
          id.includes(`/node_modules/${packageName}/`) || id.includes(`\\node_modules\\${packageName}\\`),
      )
    ) {
      return chunkName;
    }
  }

  return undefined;
};

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveVendorChunk,
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4174',
        changeOrigin: true,
      },
    },
  },
});
