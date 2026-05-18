# ADR-0003: Vitest-only testing, Kent C. Dodds–style

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** @flagrare
- **Supersedes:** part of [ADR-0002](./0002-bootstrap-stack.md) (the ATDD-framework choice; the rest of the stack stands)

## Context and Problem Statement

[ADR-0002](./0002-bootstrap-stack.md) picked `@cucumber/cucumber` as the ATDD framework, reading the user's "start from ATDD" brief as "Gherkin features + step definitions." After landing the first real feature (the `Story` facade), the cost showed up: Cucumber duplicated intent (Gherkin scenario + step-def glue both expressing the same assertions), required two test runners and two configs, hit an ESM-default-double-wrap bug in its own config loader, and produced step-def files that were largely typing ceremony over `assert`. The Vitest tests written in parallel covered the same behaviour in fewer lines, with one runner, and read just as much like a specification.

The deeper question — *what does testing JS/TS well actually look like for a library?* — wasn't answered in ADR-0002. We answered it now by grounding the project in Kent C. Dodds's testing philosophy (Testing Trophy, "the more your tests resemble the way your software is used, the more confidence they can give you", test the public surface, no implementation details, no translation layer). The full philosophy as it applies here lives in agent memory at `~/.claude/projects/-home-flagrare-Dev-poltergink/memory/feedback_kent_dodds_testing.md`.

## Decision Drivers

- **Behaviour-first** testing — tests should describe what a consumer of the library can observe and rely on, not what the implementation happens to do today.
- **One runner, one language.** Two test stacks doubles config, doubles report formats, and means CI has to wait on both.
- **No translation layer.** The "scenario in English → step def in code" round-trip pays off when non-engineers write features. For a TS library where the same engineer writes both, it's pure overhead.
- **Refactor safety.** Tests should survive internal renames and signature tweaks as long as the public contract holds.
- **Kent C. Dodds's principles are the working model** for this project going forward (see the memory file above).

## Considered Options

- **A: Vitest only, with behaviour-named `describe` / `it` blocks** that read as specification.
- **B: Keep `@cucumber/cucumber`** for the Gherkin executable-spec value.
- **C: Hybrid** — Cucumber for a handful of end-to-end "play a full story with an LLM" scenarios, Vitest for everything else.

## Decision Outcome

**Chosen option: "A — Vitest only, behaviour-named tests."**

ATDD-first stays — the workflow is *write the test first, watch it fail, then implement* — but it's expressed in Vitest, not in Gherkin. Test names are the specification:

```ts
describe("Story", () => {
  describe("advancing", () => {
    it("returns the opening text and the author-defined choices", () => { /* … */ });
    it("captures passage-level tags on the Scene", () => { /* … */ });
    it("returns ended=true when no text and no choices remain", () => { /* … */ });
  });
  describe("choosing", () => {
    it("advances past the chosen branch", () => { /* … */ });
    it("rejects an out-of-range index with StoryChoiceRangeError", () => { /* … */ });
  });
});
```

This reads as behaviour, runs in one runner, and the test file lives next to the code it covers.

The default test style is **"integration" in Kent's sense** — instantiate real collaborators through the public API, assert on real return values. Mock only at *external* boundaries (the LLM provider when we get there). Don't mock our own classes to test our own classes. Don't reach into private state. Don't assert on `error.message` text — assert `instanceof TypedError` plus its public properties.

### Consequences

- *Good:* One runner. One language. One config. No more cucumber-config gotchas.
- *Good:* Tests are refactor-safe by construction — they exercise the public surface, so renaming `_inner` to `_runtime` doesn't break anything.
- *Good:* The team's mental model is unified — "write a Vitest test" is the only ritual.
- *Good:* CI pipeline is shorter (one test step, not two).
- *Bad / accepted cost:* We give up the "non-engineer can write Gherkin" affordance. Not needed for a TS library.
- *Bad / accepted cost:* `describe` / `it` names become load-bearing — they're the only thing standing in for the executable spec. Reviewers need to push back on `it("works")` and `it("test 1")` the way they'd push back on a vague Gherkin scenario.

## Pros and Cons of the Options

### A: Vitest only, behaviour-named
- *Good:* Single runner, single config, single language. Tests next to code. Refactor-safe.
- *Good:* Aligns with Kent's philosophy: test through the public API, no translation layer.
- *Good:* AHA `setup()` factories supersede `beforeEach` for shared fixtures.
- *Bad:* Test names are the only spec — relies on review discipline.

### B: Keep Cucumber
- *Good:* Real "executable spec" artefact — the `.feature` file reads as English.
- *Good:* Pays off when product/QA stakeholders write features.
- *Bad:* Two runners, two configs, two languages, two report formats.
- *Bad:* Step defs are mostly typing ceremony over `assert` calls — duplication of intent.
- *Bad:* Kent's principle ("tests resemble the way software is used") is *harder* through Cucumber, not easier — the Gherkin describes one layer, the step-def implementation describes another, and only the union reflects the actual call site.

### C: Hybrid
- *Good:* Most flexible.
- *Bad:* All the costs of B plus the cognitive overhead of "is this a Cucumber-shaped feature or a Vitest-shaped one?" Tribal knowledge tax.

## Consequences for the codebase

Concrete deltas, executed in the same window as this ADR landing:

- Delete `features/`, `cucumber.js`, the `test:atdd` script.
- Remove `@cucumber/cucumber` (and `tsx`, which was only there as the cucumber loader).
- Drop the `test:atdd` step from `pnpm verify`.
- Drop the cucumber dep from `knip.json` ignore list.
- Update `CONTRIBUTING.md`'s "ATDD-first" section to point at "behaviour-named Vitest tests" instead of Gherkin.
- Update `ADR-0002`'s Status header to mark the ATDD-framework decision as superseded.

## More Information

- Working model for testing: `~/.claude/projects/-home-flagrare-Dev-poltergink/memory/feedback_kent_dodds_testing.md` (Testing Trophy, public-API-only, mock at the boundary, AHA over beforeEach, behaviour-named tests).
- Kent's canonical posts:
  - <https://kentcdodds.com/blog/write-tests>
  - <https://kentcdodds.com/blog/testing-implementation-details>
  - <https://kentcdodds.com/blog/how-to-know-what-to-test>
  - <https://kentcdodds.com/blog/aha-testing>
- Testing Library guiding principles: <https://testing-library.com/docs/guiding-principles/>
- Related: [ADR-0001](./0001-mission-and-scope.md), [ADR-0002](./0002-bootstrap-stack.md).
