---
"poltergink": minor
---

Add the `Player` interface and the `Session` orchestrator, plus the reference `ScriptedPlayer`.

- `Player` — the strategy contract for "what picks the next choice." Implementations receive a `TurnContext` (current `scene` + running `history`) and return a `Decision` (`choiceIndex`, optional `reasoning`, optional `raw`).
- `ScriptedPlayer(script: readonly number[])` — walks a fixed list of choice indices. Used by tests and reproducible demos. Throws `ScriptExhaustedError` (carrying `.scriptLength` and `.turnIndex`) if the story still wants a decision after the script runs out.
- `Session({ story, player })` — drives the turn loop until the story ends. `await session.run()` returns a `SessionResult` with the full list of `Turn`s and the final `Scene`.

The `Transcript` model with events and snapshots remains for a follow-up release.
