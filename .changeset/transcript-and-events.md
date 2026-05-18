---
"poltergink": minor
---

Add `Transcript` and typed `Session` event emission.

- New `Transcript` shape (replaces the prior `SessionResult`): `turns: readonly TurnRecord[]`, `finalScene: Scene`, `finalSnapshot: string`. Every `TurnRecord` carries the scene shown, the decision made, and `snapshotBefore` / `snapshotAfter` — full inkjs state JSON blobs round-trippable through `Story.restore`, so any turn can be replayed on a fresh story.
- `Session.on(type, listener)` returns an unsubscribe function. Events are a discriminated union on `type`: `turn:start`, `choice:made` (carrying the full `TurnRecord`), `story:ended` (carrying the `finalScene`).
- New `SessionOptions.maxTurns` cap. Exceeding it throws `SessionMaxTurnsError` carrying the partial `Transcript` for debugging — a safety net for unfamiliar stories.
- `Session.run()` now returns `Transcript` (frozen). Existing call sites that destructure `{ turns, finalScene }` continue to work; new `finalSnapshot`, `snapshotBefore`, `snapshotAfter` are additive.
