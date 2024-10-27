import { defineConfig } from "vitest/config";
import { VitePWA } from 'vite-plugin-pwa'
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(),     VitePWA({ registerType: 'autoUpdate' })],
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [],
    },
  },
});
