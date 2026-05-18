# poltergink

[![CI](https://github.com/Eldriss-Studio/poltergink/actions/workflows/ci.yml/badge.svg)](https://github.com/Eldriss-Studio/poltergink/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> A *poltergeist* in the *Ink* shell — an LLM-native TypeScript wrapper around [inkjs](https://github.com/y-lohse/inkjs).

`poltergink` makes Inkle's [Ink](https://github.com/inkle/ink) narrative engine **two-sided**: instead of a human picking branches, an LLM holds a persona, reads the unfolding story, and is *forced* to pick from the author-defined `currentChoices`. No freeform text, no off-script generation — just constrained choice selection over a real narrative graph.

> **Status:** Early development. The `Story` facade is shipped and tested. `Player`, `Persona`, `Session`, and `Transcript` are next.

## What's available

### `Story` — the narrative facade

Load an Ink story from raw `.ink` source or pre-compiled JSON, advance it turn by turn, pick choices, and snapshot/restore state. This is the foundation everything else builds on.

```ts
import { Story } from "poltergink";

// Load from raw .ink source (inkjs Compiler bundled — no inklecate needed)
const story = Story.fromInk(`
  You stand at a crossroads.
  * [Go north] -> north
  * [Go south] -> south
  ...
`);

// Or from pre-compiled JSON
// const story = Story.fromJson(compiledJsonString);

// Advance until the next choice point (or the end)
const scene = story.advance();
console.log(scene.text);     // accumulated passage text
console.log(scene.choices);  // Choice[] the player can pick from
console.log(scene.tags);     // passage-level tags emitted this turn
console.log(scene.ended);    // true when story is over

// Pick a choice by its zero-based index
story.choose(0);
const next = story.advance();

// Save and restore full story state
const saved = story.snapshot();
story.restore(saved);
```

**Exported types:** `Choice`, `Scene`, `Story`, `StoryChoiceRangeError`.

`StoryChoiceRangeError` carries `.attempted` and `.available` so callers can surface a clean error without parsing a message string.

### Tag-driven routing

Ink tags flow through at two levels: passage tags appear on `Scene.tags` after each `advance()`; choice tags (written before the choice's bracketed text) appear on `Choice.tags` at decision time. The `PersonaDirector` (coming in v0) will read these to select a persona at the branch point.

```ink
A stranger approaches. # mood:tense
* # persona:detective [Ask who they are]  <- Choice.tags = ["persona:detective"]
  -> interrogate
* # persona:charmer [Smile and wave]
  -> deflect
```

## Roadmap (v0)

- [x] `Story` facade over `inkjs` — `.fromInk`, `.fromJson`, `.advance`, `.choose`, `.snapshot`, `.restore`
- [ ] `Player` strategy — `LLMPlayer` (Vercel AI SDK + Zod-constrained output), `ScriptedPlayer`, `RandomPlayer`
- [ ] `Persona` + `PersonaDirector` — tag-driven persona switching mid-session
- [ ] `Session` orchestrator with an observable, immutable `Transcript` and typed turn events
- [ ] Astro Starlight docs site with TypeDoc-generated API reference

## Design references

- **[ADR-0001 — Mission and scope](./docs/decisions/0001-mission-and-scope.md)** — what `poltergink` is, the contract it honors, and what is in / out of scope for v0. **Start here.**
- **[ADR-0002 — Bootstrap stack](./docs/decisions/0002-bootstrap-stack.md)** — the full toolchain: Vercel AI SDK, tsup, Biome, Vitest, Changesets.
- **[ADR-0003 — Vitest-only testing](./docs/decisions/0003-vitest-only-testing.md)** — why Cucumber was dropped in favour of behaviour-named Vitest tests.
- **[Decision records index](./docs/decisions/README.md)** — all ADRs and how to add one.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the ATDD-first workflow, commit conventions, and the **ADR process** for proposing or recording a load-bearing decision. Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Yuri Flagrare.
