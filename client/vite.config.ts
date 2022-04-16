import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Auto import components
    // https://github.com/antfu/unplugin-vue-components
    Components(),
  ],
  server: {
    port: 8000,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: ["vue"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Import custom bootstrap variable overrides in every component
        additionalData: `@import "./src/styles/variables";`,
        charset: false,
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [visualizer()],
    },
  },
});
