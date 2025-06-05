import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Only include what you need, e.g.:
      include: ['process'],
      protocolImports: true,
      globals: {
        process: true,
        Buffer: true,
        global: true,
      },
    }),
  ],
})
