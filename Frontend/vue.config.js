// module.exports = {
//   css: {
//     loaderOptions: {
//       sass: {
//         prependData: `@import "@/scss/custom.scss"`,
//       },
//     },
//   },
// };
module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = "XCCup 2022";
      return args;
    });
  },
  configureWebpack: {
    devtool: "source-map",
  },
};
