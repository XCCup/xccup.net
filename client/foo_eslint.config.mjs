// export default defineConfig(
//   pluginVue.configs["flat/recommended"],
//   //   ...pluginCypress.configs.recommended,
//   //   ...vueTsEslintConfig(),
//   // eslintConfigPrettier,
//   {
//     rules: {
//       "vue/multi-word-component-names": "off",
//     },
//   }
// );

import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
export default [
  // add more generic rulesets here, such as:
  // js.configs.recommended,
  eslintConfigPrettier,
  ...pluginVue.configs["flat/essential"],
  // // ...pluginVue.configs['flat/vue2-recommended'], // Use this if you are using Vue.js 2.x.
  // {
  //   rules: {
  //     // override/add rules settings here, such as:
  //     // 'vue/no-unused-vars': 'error'
  //   },
  // },
];
