const path = require('path');
module.exports = function (webpackConfig) {
  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push({ apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('node-builtins-empty', (nmf) => {
      nmf.hooks.beforeResolve.tap('node-builtins-empty', (data) => {
        if (/^node:(fs|https)$/.test(data.request)) data.request = path.resolve(__dirname, 'empty.js');
      });
    });
  } });
  return webpackConfig;
};
