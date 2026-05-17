/**
 * Cucumber.js configuration. Loads .feature files from features/ and TypeScript
 * step definitions via tsx (registered through NODE_OPTIONS in the test:atdd
 * script). The exported object IS the default profile — cucumber unwraps the
 * ESM `default` once.
 */
export default {
  paths: ["features/**/*.feature"],
  import: ["features/step_definitions/**/*.ts", "features/support/**/*.ts"],
  format: ["progress-bar", "summary"],
  publishQuiet: true,
};
