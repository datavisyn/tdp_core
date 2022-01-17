module.exports = {
    root: true,
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
      // Make sure eslint and VS Code use the same path for the tsconfig.json:
      // https://github.com/typescript-eslint/typescript-eslint/issues/251
      tsconfigRootDir: __dirname,
      project: "./tsconfig.json",
      ecmaVersion: 2018, 
      sourceType: 'module'
    },
    rules: {
      "linebreak-style": "off",
      "class-methods-use-this":"off",
      "no-continue": "off",
      "no-multi-assign": "warn",
      "no-nested-ternary": "off",
      "no-param-reassign": ["error", { "props": false }],
      "no-return-assign": "warn", 
      "no-restricted-syntax": "off",
      "no-plusplus": "off",
      "no-prototype-builtins": "warn",
      "no-minusminus": "off",
      "no-underscore-dangle": "off",
      "max-classes-per-file": "off",
      "no-param-reassign": "warn",
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",
      "import/order": "error",
      "prefer-destructuring": ["warn", {"object": true, "array": false}],
      "prefer-promise-reject-errors": "warn",
      "prefer-spread": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/destructuring-assignment": "warn",
      "react/jsx-props-no-spreading": "off",
      "react/no-unused-class-component-methods": "warn",
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