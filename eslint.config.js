// Minimal ESLint flat config. Biome owns lint+format for everything else;
// this exists only to enforce TSDoc syntax on exported symbols (a rule
// Biome does not provide). See ADR-0002.

import tsdoc from "eslint-plugin-tsdoc";

export default [
  {
    files: ["src/**/*.ts"],
    plugins: { tsdoc },
    rules: {
      "tsdoc/syntax": "error",
    },
  },
];
