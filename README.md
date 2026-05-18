# poltergink

[![CI](https://github.com/Eldriss-Studio/poltergink/actions/workflows/ci.yml/badge.svg)](https://github.com/Eldriss-Studio/poltergink/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> A *poltergeist* in the *Ink* shell — an LLM-native TypeScript wrapper around [inkjs](https://github.com/y-lohse/inkjs).

`poltergink` makes Inkle's [Ink](https://github.com/inkle/ink) narrative engine **two-sided**: instead of a human picking branches, an LLM holds a persona, reads the unfolding story, and is *forced* to pick from the author-defined `currentChoices`. No freeform text, no off-script generation — just constrained choice selection over a real narrative graph.

> **Status:** Early development. The `Story` facade, the `Player` interface with `ScriptedPlayer`, the `Session` orchestrator with typed event emission, and the `Transcript` (with per-turn snapshots) are shipped and tested. `LLMPlayer` and `Persona` are next.

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

### `Player`, `ScriptedPlayer`, `Session` — the turn loop

The `Session` orchestrator drives a `Story` through a `Player` until the story ends. `ScriptedPlayer` is the deterministic reference player used by tests and reproducible demos.

```ts
import { ScriptedPlayer, Session, Story } from "poltergink";

const story = Story.fromInk(`
  At the door.
  * [Knock]   -> answered
  * [Walk away] -> END
  === answered ===
  Someone opens. -> END
`);

const player = new ScriptedPlayer([0]); // pre-decided sequence of choice indices
const session = new Session({ story, player });

const result = await session.run();
console.log(result.turns);       // [{ scene, decision }, …]
console.log(result.finalScene);  // the ended scene (closing narrative, ended === true)
```

**`Player` contract.** Any implementation of `Player.selectChoice(ctx)` works — `ScriptedPlayer`, your own heuristic class, or the upcoming `LLMPlayer`. `ctx` carries the current `scene` plus the running `history` of completed `Turn`s; pass that history to an LLM as context, look at it in a heuristic player, or ignore it entirely. The return is a `Decision` — `{ choiceIndex, reasoning?, raw? }`.

**`ScriptExhaustedError`** carries `.scriptLength` and `.turnIndex` so callers can pinpoint exactly where the script ran out.

### `Transcript` + typed events

`Session.run()` returns a frozen `Transcript`: every turn includes the scene shown, the decision made, and full state snapshots before and after the choice. Snapshots are inkjs `state.ToJson` blobs — round-trippable via `Story.restore`, so any turn can be replayed from a fresh story.

```ts
const transcript = await session.run();

// Every TurnRecord is immutable.
for (const turn of transcript.turns) {
  console.log(`turn ${turn.index}: chose ${turn.decision.choiceIndex}`);

  // Replay from this exact branch point on a fresh story.
  const replay = Story.fromInk(source);
  replay.restore(turn.snapshotBefore);
  // replay.advance() now sees the same scene `turn.scene` saw.
}

console.log(transcript.finalScene.text);   // closing narrative
console.log(transcript.finalSnapshot);     // post-end state JSON
```

`Session` also emits typed events during the run — useful for live UIs, instrumentation, or feeding an LLM context-window with what's just happened:

```ts
const unsubscribe = session.on("choice:made", (e) => {
  console.log(`turn ${e.turnIndex}: ${e.record.decision.choiceIndex}`);
});
// unsubscribe() to stop listening.

session.on("turn:start", (e) => { /* … */ });
session.on("story:ended", (e) => console.log(e.finalScene.text));
```

`SessionEvent` is a discriminated union (`turn:start` | `choice:made` | `story:ended`) — `e.type === "choice:made"` narrows to the record-carrying variant.

`Session` accepts an optional `maxTurns` cap. If exceeded it throws `SessionMaxTurnsError` carrying the partial `Transcript` — useful as a runaway-loop safety net or in tests against unfamiliar stories.

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
- [x] `Player` interface — `Player`, `TurnContext`, `Decision`, `Turn`
- [x] `ScriptedPlayer` — deterministic, for tests and reproducible demos
- [x] `Session` orchestrator — drives a `Story` × `Player` to completion
- [x] `Transcript` — per-turn snapshots, replay from any turn
- [x] Typed `Session` events — `turn:start`, `choice:made`, `story:ended`
- [ ] `LLMPlayer` — Vercel AI SDK + Zod-constrained output
- [ ] `Persona` + `PersonaDirector` — tag-driven persona switching mid-session
- [ ] Astro Starlight docs site with TypeDoc-generated API reference

## Design references

- **[ADR-0001 — Mission and scope](./docs/decisions/0001-mission-and-scope.md)** — what `poltergink` is, the contract it honors, and what is in / out of scope for v0. **Start here.**
- **[ADR-0002 — Bootstrap stack](./docs/decisions/0002-bootstrap-stack.md)** — the full toolchain: Vercel AI SDK, tsup, Biome, Vitest, Changesets.
- **[ADR-0003 — Vitest-only testing](./docs/decisions/0003-vitest-only-testing.md)** — why Cucumber was dropped in favour of behaviour-named Vitest tests.
- **[Decision records index](./docs/decisions/README.md)** — all ADRs and how to add one.
- **[Research log](./docs/research/README.md)** — external research that informed the design (LLM persona patterns, emotion + memory models, Ink event emission). The evidence base behind the decisions.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the ATDD-first workflow, commit conventions, and the **ADR process** for proposing or recording a load-bearing decision. Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Yuri Flagrare.
