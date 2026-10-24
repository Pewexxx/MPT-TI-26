import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // In dev, forward /api to the Fastify server so the browser sees one origin
    proxy: { '/api': process.env.API_URL ?? 'http://localhost:3000' },
  },
});
