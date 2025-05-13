// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});

