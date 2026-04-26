/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@familia/eslint-config/node.cjs"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  // Nest uses heavy decorators; relax a few rules.
  rules: {
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": "off", // we use pino, but keep loose
  },
};
