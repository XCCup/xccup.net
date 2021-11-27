import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";

// https://vueschool.io/articles/vuejs-tutorials/import-aliases-in-vite/
const path = require("path");

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

  // https://vueschool.io/articles/vuejs-tutorials/import-aliases-in-vite/
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
