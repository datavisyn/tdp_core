const path = require('path');

module.exports = {
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
    return config;
  },
}