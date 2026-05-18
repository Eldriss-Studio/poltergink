/**
 * `Transcript` — the immutable record of a {@link Session} run.
 *
 * @remarks
 * What `Session.run()` returns. The transcript captures the scene shown
 * at each turn, the decision the player made, and full state snapshots
 * before and after each choice. Snapshots are inkjs `state.ToJson` blobs,
 * round-trippable through {@link Story.restore} — that's what makes a
 * session *replayable* turn-by-turn.
 *
 * @packageDocumentation
 */

import type { Decision } from "./player.ts";
import type { Scene } from "./story.ts";

/**
 * One row in a {@link Transcript}.
 */
export interface TurnRecord {
  /** Zero-based ordinal of this turn within the session. */
  readonly index: number;
  /** The scene the player was shown at this branch point. */
  readonly scene: Scene;
  /** The decision the player returned. */
  readonly decision: Decision;
  /**
   * Full inkjs state JSON captured *immediately before* this turn's
   * choice was applied. Pass it to {@link Story.restore} on a fresh
   * `Story` to resume from this exact branch point.
   */
  readonly snapshotBefore: string;
  /**
   * Full inkjs state JSON captured *immediately after* this turn's
   * choice was applied (before the next `advance` runs).
   */
  readonly snapshotAfter: string;
}

/**
 * The complete record of a {@link Session.run} call.
 *
 * @remarks
 * Immutable (frozen). Every field is either a primitive, a readonly
 * array, or a frozen object — safe to share, log, persist, or replay
 * from. Persona / event-history fields will join in future tasks
 * without breaking the current shape (additive only).
 */
export interface Transcript {
  /** Every completed turn, in order. */
  readonly turns: readonly TurnRecord[];
  /**
   * The story's final scene — the ended one reached after the last
   * decision. `finalScene.ended === true` for a normal completion.
   */
  readonly finalScene: Scene;
  /**
   * State snapshot of the story at the moment the session ended.
   * Restoring this onto a fresh story leaves you at the same end state.
   */
  readonly finalSnapshot: string;
}
