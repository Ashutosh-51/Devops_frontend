import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://2361-114-143-110-34.ngrok-free.app/api/v1',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/whoami': {
        target: 'https://2361-114-143-110-34.ngrok-free.app/',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/login': {
        target: 'https://2361-114-143-110-34.ngrok-free.app/',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      },
      '/logout': {
        target: 'https://2361-114-143-110-34.ngrok-free.app/',
        changeOrigin: true,
        secure: false,
        withCredentials: true
      }
    }
  }
});