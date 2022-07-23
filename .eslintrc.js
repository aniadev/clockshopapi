module.exports = {
  extends: ["prettier"],
  plugins: ["prettier", "import"],
  rules: {
    "prettier/prettier": ["warn"],
    "import/no-unresolved": "warn", // turn on errors for missing imports
    "no-use-before-define": 0,
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external"],
        "newlines-between": "always",
      },
    ],
    "import/newline-after-import": 1,
  },
  settings: {},
  parserOptions: {
    ecmaVersion: "latest",
  },

  env: {
    es6: true,
  },
}
