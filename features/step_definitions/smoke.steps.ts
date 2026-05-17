import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import { VERSION } from "../../src/index.ts";

let pkg: typeof import("../../src/index.ts") | undefined;
let observed: string | undefined;

Given("the poltergink package is importable", async () => {
  pkg = await import("../../src/index.ts");
  assert.ok(pkg);
});

When("I read its exported VERSION", () => {
  observed = VERSION;
});

Then("it should match the package.json version", async () => {
  const packageJson = (await import("../../package.json", { with: { type: "json" } })) as {
    default: { version: string };
  };
  assert.equal(observed, packageJson.default.version);
});
