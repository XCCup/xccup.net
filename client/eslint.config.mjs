import js from "@eslint/js";
import { vueTsConfigs, withVueTs } from "@vue/eslint-config-typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginCypress from "eslint-plugin-cypress";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default withVueTs(
  {
    scriptLangs: ["ts", "js"],
  },
  js.configs.recommended,
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    files: ["src/**/*.{js,ts,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        defineEmits: "readonly",
        defineExpose: "readonly",
        defineProps: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "none" }],
      "@typescript-eslint/no-unsafe-function-type": "off",
      "no-useless-assignment": "off",
      "preserve-caught-error": "off",
      "vue/multi-word-component-names": "off",
    },
  },
  {
    files: ["cypress/**/*.js", "cypress.config.js"],
    plugins: {
      cypress: pluginCypress,
    },
    languageOptions: {
      ...pluginCypress.configs.recommended.languageOptions,
      globals: {
        ...pluginCypress.configs.recommended.languageOptions.globals,
        ...globals.node,
      },
    },
    rules: {
      ...pluginCypress.configs.recommended.rules,
      "@typescript-eslint/no-require-imports": "off",
      "cypress/unsafe-to-chain-command": "off",
    },
  },
  eslintConfigPrettier
);
