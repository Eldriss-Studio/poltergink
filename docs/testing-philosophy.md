# Testing philosophy

This document captures the working model for testing in this project. It's referenced by [ADR-0003](./decisions/0003-vitest-only-testing.md) and is the place to go when a "how should I test this?" question comes up.

The model is **Kent C. Dodds–style testing**: behaviour over implementation, mostly integration over unit, public-API-only, no translation layer.

## The single sentence

> *"The more your tests resemble the way your software is used, the more confidence they can give you."*

Everything else follows from this. If a test exercises code the way a real caller would, it gives real confidence. If it exercises code the way only the test does, it gives false confidence and creates refactor friction.

## The Testing Trophy

```
        E2E       (a sliver)
     Integration  (the BULK — best confidence-per-effort)
       Unit       (some — for genuinely isolated logic)
       Static     (TS strict + Biome — always on, free)
```

"Integration" here is *not* the Spring-style "with-a-database" sense. It means **multiple units working together through the public surface** — instantiate the real classes, call the real methods, assert on the real return values. For a library, that's the default.

## What "implementation detail" means

An implementation detail is anything a consumer of the public API can't see, use, or care about:

- Private methods, private state shapes, internal field names.
- The exact wording of an error's `.message` (vs. the error *type* and its public properties — those are part of the contract).
- The order internal collaborators are called.
- Helper functions that aren't exported.

Testing implementation details costs twice:

1. **False negatives on refactor.** Rename `_openIdx` to `_openIndices` and tests go red even though behaviour is identical.
2. **False positives in production.** A test asserts `internal.callSpy` was called, but the wiring to the user-visible behaviour got disconnected. The test passes; the feature is broken.

Heuristic: ask *who is the user?* For a library, the user is the calling code. If the call site can't observe it, don't test it.

## When to mock — and when not to

- **Mock at the boundary, not at your own internals.** External I/O (the LLM provider when we get there, the network, the clock) is a boundary. Your own classes are not.
- **Don't mock for speed.** If the real thing is slow, that's a real performance issue, not a test problem.
- **Prefer interception over hand-rolled mocks** for HTTP (e.g., MSW). Same handler runs in tests and dev, so refactors don't break tests.

For `poltergink` specifically: don't mock `Story` to test `Session`. Use a real `Story` with a fixture `.ink`. The only thing currently worth mocking is the LLM provider (when `LLMPlayer` lands) — that's the real external boundary.

## AHA Testing — Avoid Hasty Abstraction

Tests live between two failure modes:

- **No abstraction**: total duplication, hard to read, painful to update.
- **DRY taken too far**: aggressive `beforeEach` / shared mutable state, obscures what each test actually asserts.

The sweet spot: a `setup()` factory that returns sane defaults, with per-test overrides only for what matters.

```ts
function setup(overrides: Partial<SessionConfig> = {}) {
  return { session: makeSession({ ...defaults, ...overrides }) };
}

it("ends when the story has no choices and no canContinue", () => {
  const { session } = setup({ storyInk: TERMINAL_INK });
  /* … */
});
```

No deep nested `beforeEach`. No shared mutable variables between tests. Parameterised cases via `test.each` / `it.each` when many inputs share one assertion shape.

## Applying the model to this library

| In a UI app | In `poltergink` |
|---|---|
| "The user" | The calling code — the developer importing `poltergink` |
| "Click a button" | Call a public method (`session.run()`, `story.advance()`) |
| "Read screen text" | Read return values / inspect `Transcript` |
| "Render a real tree" | Use a real `inkjs.Story` from a fixture, not a mock |
| "Query by role" | Access documented `Choice.text`, `Choice.index`, `Scene.tags` — not internals |
| "Avoid data-testid" | Don't reach into `(story as any)._inner` |
| "Mock the network" | Mock the LLM provider — that's where the external boundary is |

The library's user journey:

1. Load an `.ink` (or `.json`) story.
2. Pick a Player (LLM / scripted / random).
3. Run a Session — get a Transcript back.

Most tests should look like that — instantiate the real `Story`, drive it through `Session`, assert on the resulting `Transcript`. Unit tests are appropriate for genuinely isolated logic (a tag parser, an index-clamping helper, the persona-tag matching rule).

## Six rules of thumb

1. **Default to integration-style tests.** Real `Story`, real `Session`, real `Transcript`. Mock only the LLM provider boundary.
2. **Name the behaviour, not the method.** `it("rejects an out-of-range choice index with StoryChoiceRangeError")` beats `it("choose method throws")`.
3. **Assert on contracts, not strings.** `expect(err).toBeInstanceOf(StoryChoiceRangeError)` and on its public `.attempted` / `.available` — not on `err.message`.
4. **AHA factories over `beforeEach`.** Inline `setup()` returning sane defaults; tests override what differs.
5. **Don't reach into private state.** If a test needs to, the public API is missing something — fix the API first.
6. **Coverage is a smell detector, not a target.** 100% line coverage with no use-case coverage is worthless. Branches we leave uncovered (e.g., defensive `?? null` on typed `string | null` unions) are documented in `vitest.config.ts`.

## References

- Kent C. Dodds, ["Write tests. Not too many. Mostly integration."](https://kentcdodds.com/blog/write-tests)
- ["The Testing Trophy and Testing Classifications"](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- ["Testing Implementation Details"](https://kentcdodds.com/blog/testing-implementation-details)
- ["How to know what to test"](https://kentcdodds.com/blog/how-to-know-what-to-test)
- ["AHA Testing"](https://kentcdodds.com/blog/aha-testing)
- ["The Merits of Mocking"](https://kentcdodds.com/blog/the-merits-of-mocking)
- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/)
