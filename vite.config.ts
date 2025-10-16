/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-helmet-async') ||
              id.includes('i18next') ||
              id.includes('react-i18next')
            ) {
              return 'vendor';
            }
            if (id.includes('howler')) return 'sounds';
            if (id.includes('partysocket')) return 'partykit';
            if (id.includes('emoji-picker')) return 'emoji';
          }
        },
      },
    },
  },
  ssr: {
    noExternal: ['react-router-dom', 'react-helmet-async'],
  },
});
