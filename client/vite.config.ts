import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // vite config
    plugins: [
      vue(),
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: ["vue", "vue/macros", "vue-router", "@vueuse/core"],
        dts: true,
        dirs: ["./src/composables"],
        vueTemplate: true,
      }),

      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
      }),
      sentryVitePlugin({
        org: "xccup",
        project: "xccup-client",
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],
    resolve: {
      alias: {
        "@/": `${path.resolve(__dirname, "src")}/`,
        "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
      },
    },
    server: {
      port: 8000,
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
      sourcemap: true,
    },
  };
});
