const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


// loading our custom webpack.config.js
const webpackConfig = require('visyn_scripts/config/webpack.config.js');


const appPkg = require(path.join('./../', 'package.json'));
const isEnvProduction = true;

const { entries } = appPkg.visyn;
module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/preset-scss"
  ],
  framework: "@storybook/react",
  webpackFinal: async (config) => {
    // Add tdp_core/dist as alias, as we have scss/code imports like tdp_core/dist/assets/...
    // These can only be resolved in a workspace currently, and not in the standalone repo.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'tdp_core/dist': path.resolve(__dirname, '../', 'dist'),
    };
    // config.resolve.alias["core-js/modules"] = "@storybook/core/node_modules/core-js/modules";     
    // config.resolve.alias["core-js/features"] = "@storybook/core/node_modules/core-js/features";
    config.plugins.push(new MiniCssExtractPlugin());
    config.plugins.push( new HtmlWebpackPlugin({
        inject: true,
        template: './storybook-static/index.html',
        filename: "storybook test",
        title: "Storybook",
        excludeChunks: true,
        meta: {
          description: "storybook test description",
        },
        ...(isEnvProduction
          ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
          : {}),
      }),
    );
    return { 
      ...config,
      module: { ...config.module, rules: webpackConfig({ workspace_mode: 'single' }, { mode: 'production' }).module.rules },
    }
  },
}