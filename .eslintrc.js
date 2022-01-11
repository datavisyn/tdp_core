module.exports = {
    extends: [
      "airbnb",
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
      "no-return-assign": "warn",
      "no-restricted-syntax": "off",
      "no-plusplus": "off",
      "no-minusminus": "off",
      "no-underscore-dangle": "off",
      "max-classes-per-file": "off",
      "no-param-reassign": "warn",
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",
      "import/order": "error",
      "prefer-promise-reject-errors": "warn",
      "prefer-spread": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/destructuring-assignment": "warn",
      "react/jsx-props-no-spreading": "off",
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/static-property-placement": ["warn", "property assignment", {
        childContextTypes: "static getter",
        contextTypes: "static public field",
        contextType: "static public field",
        displayName: "static public field",
      }]
    }
  };