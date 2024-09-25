import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // Allow external connections (necessary for Docker)
    port: 5174,          
    watch: {
      usePolling: true,  // Use polling for file changes (helps with Docker)
    },
  },
});

