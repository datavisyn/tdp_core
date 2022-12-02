const path = require('path');

// loading our custom webpack.config.js
const webpackConfig = require('visyn_scripts/config/webpack.config.js');

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
      'tdp_core/dist': path.resolve(__dirname, '../', 'dist')
    };
    return { 
      // using our custom webpack config
     ...webpackConfig({ workspace_mode: 'single' }, { mode: 'production' })
    };
  },
}