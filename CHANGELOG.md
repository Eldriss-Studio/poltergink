# poltergink

## 0.1.0

### Minor Changes

- 435a787: Add the `Player` interface and the `Session` orchestrator, plus the reference `ScriptedPlayer`.

  - `Player` — the strategy contract for "what picks the next choice." Implementations receive a `TurnContext` (current `scene` + running `history`) and return a `Decision` (`choiceIndex`, optional `reasoning`, optional `raw`).
  - `ScriptedPlayer(script: readonly number[])` — walks a fixed list of choice indices. Used by tests and reproducible demos. Throws `ScriptExhaustedError` (carrying `.scriptLength` and `.turnIndex`) if the story still wants a decision after the script runs out.
  - `Session({ story, player })` — drives the turn loop until the story ends. `await session.run()` returns a `SessionResult` with the full list of `Turn`s and the final `Scene`.

  The `Transcript` model with events and snapshots remains for a follow-up release.

- 0621eca: Add `Transcript` and typed `Session` event emission.

  - New `Transcript` shape (replaces the prior `SessionResult`): `turns: readonly TurnRecord[]`, `finalScene: Scene`, `finalSnapshot: string`. Every `TurnRecord` carries the scene shown, the decision made, and `snapshotBefore` / `snapshotAfter` — full inkjs state JSON blobs round-trippable through `Story.restore`, so any turn can be replayed on a fresh story.
  - `Session.on(type, listener)` returns an unsubscribe function. Events are a discriminated union on `type`: `turn:start`, `choice:made` (carrying the full `TurnRecord`), `story:ended` (carrying the `finalScene`).
  - New `SessionOptions.maxTurns` cap. Exceeding it throws `SessionMaxTurnsError` carrying the partial `Transcript` for debugging — a safety net for unfamiliar stories.
  - `Session.run()` now returns `Transcript` (frozen). Existing call sites that destructure `{ turns, finalScene }` continue to work; new `finalSnapshot`, `snapshotBefore`, `snapshotAfter` are additive.
