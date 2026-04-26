/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["./react.cjs"],
  plugins: ["react-native"],
  env: {
    "react-native/react-native": true,
  },
  rules: {
    "react-native/no-inline-styles": "warn",
    "react-native/no-raw-text": "off",
    "react-native/split-platform-components": "warn",
  },
};
