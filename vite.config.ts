import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@meetcompany/demo-domain': path.resolve(__dirname, './src/demo-domain/index.ts'),
    },
  },
});
