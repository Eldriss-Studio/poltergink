import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/index.ts"],
      thresholds: {
        lines: 85,
        functions: 85,
        // Branches sit a touch lower than statements because we keep
        // defensive `?? null` guards on inkjs's `string | null` union
        // returns — branches the typed contract admits but the runtime
        // never produces. Trusting the types and removing the guards
        // would be fragile across inkjs upgrades. See Kent: coverage
        // is a smell detector, not a target.
        branches: 75,
        statements: 85,
      },
    },
  },
});
