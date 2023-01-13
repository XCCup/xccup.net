import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath, URL } from "url";
import path from "path";

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
      "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
    },
    dedupe: ["vue"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Import custom bootstrap variable overrides in every component
        additionalData: [`@import "@/styles/shared.scss";`],
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
