module.exports = {
  extends: ["prettier"],
  plugins: ["prettier", "import"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
    "import/no-unresolved": "warn", // turn on errors for missing imports
    "no-use-before-define": 0,
    "import/order": [
      "off",
      {
        groups: ["builtin", "external"],
        "newlines-between": 0,
      },
    ],
  },
  settings: {},
  parserOptions: {
    ecmaVersion: "latest",
  },

  env: {
    es6: true,
  },
}
