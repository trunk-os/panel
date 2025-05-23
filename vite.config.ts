import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Log environment variables for debugging
console.log("DEV_HOST:", process.env.DEV_HOST);

export default defineConfig({
  base: "/", // Explicitly set the base path
  plugins: [
    react(),
    // Add Node.js polyfills for browser compatibility
    nodePolyfills({
      // Polyfill specific globals needed by CBOR
      globals: {
        process: true,
        Buffer: true,
      },
      // Explicitly include the 'events' module that CBOR depends on
      include: ["events", "buffer", "stream", "util", "process"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0", // Always bind to all interfaces
    open: true,
    hmr: {
      // Configure HMR to work with custom hostname
      host: process.env.DEV_HOST || "localhost",
      port: 3000,
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
    cors: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  publicDir: "public",
  optimizeDeps: {
    include: ["cbor", "events", "buffer"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
