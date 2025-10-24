import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-router')) {
              return 'vendor-router';
            }
            if (id.includes('gsap') || id.includes('@gsap/react')) {
              return 'vendor-animation';
            }
            if (id.includes('ogl')) {
              return 'vendor-3d';
            }
            if (id.includes('lucide-react') || id.includes('class-variance-authority') ||
                id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // All other node_modules
            return 'vendor-other';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB for now
  },
});
