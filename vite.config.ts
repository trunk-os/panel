import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  // Log environment variables for debugging
  console.log("DEV_HOST:", env.DEV_HOST);
  console.log("VITE_API_BASE_URL:", env.VITE_API_BASE_URL);

  return {
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
        host: env.DEV_HOST || "localhost",
        port: 3000,
        clientPort: 3000,
      },
      watch: {
        usePolling: true,
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
      rollupOptions: {
        external: [
          "**/scripts",
          ".git",
          ".gitignore",
          "README.md",
          "CLAUDE.md",
          "test/",
          "**/__tests__/",
          "**/*.test.ts",
          "**/*.test.tsx",
          "dist/",
          "*.log",
          ".env",
          ".env.local",
          ".env.development",
          ".env.example",
          ".DS_Store",
          "Thumbs.db,",
        ],
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV || mode),
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
  };
});
