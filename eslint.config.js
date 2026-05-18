// Minimal ESLint flat config. Biome owns lint+format for everything else;
// this exists only to enforce TSDoc syntax on exported symbols (a rule
// Biome does not provide). See ADR-0002.

import tsParser from "@typescript-eslint/parser";
import tsdoc from "eslint-plugin-tsdoc";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { tsdoc },
    rules: {
      "tsdoc/syntax": "error",
    },
  },
];
