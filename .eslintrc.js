module.exports = {
    extends: [
      "airbnb-typescript",
      "airbnb/hooks",
      "eslint:recommended",
      "plugin:import/recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:jest/recommended",
      "plugin:prettier/recommended"
    ],
    plugins: ["react", "@typescript-eslint", "jest"],
    ignorePatterns: ["*.js"],
    env: {
      browser: true,
      es6: true,
      jest: true
    },
    globals: {
      Atomics: "readonly",
      SharedArrayBuffer: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      project: "./tsconfig.json"
    },
    rules: {
      "linebreak-style": "off",
      "class-methods-use-this":"off",
      "no-param-reassign": ["error", { "props": false }],
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",
      "react/static-property-placement": ["warn", "property assignment", {
        childContextTypes: "static getter",
        contextTypes: "static public field",
        contextType: "static public field",
        displayName: "static public field",
      }],
      "react/prop-types": "off",
      "react/jsx-props-no-spreading": "off",
    }
  };