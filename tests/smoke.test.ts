import { describe, expect, it } from "vitest";
import { VERSION } from "../src/index.ts";

describe("poltergink package", () => {
  it("exports a VERSION constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
