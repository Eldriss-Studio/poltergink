/**
 * `Player` — the contract for whatever decides which Ink choice to take next.
 *
 * @remarks
 * Pattern: **Strategy**. `Session` calls `player.selectChoice(...)` once per
 * branch point; the player can be deterministic (e.g. `ScriptedPlayer`),
 * random, or LLM-backed. The interface stays narrow so a test-time
 * `ScriptedPlayer` and a production `LLMPlayer` can be swapped without
 * touching `Session`.
 *
 * @packageDocumentation
 */

import type { Scene } from "./story.ts";

/**
 * What the Player returns after picking a choice.
 */
export interface Decision {
  /** Zero-based index into the scene's `choices`. */
  readonly choiceIndex: number;
  /**
   * Optional free-text explanation for *why* this choice was made.
   * LLM players populate this; scripted players usually leave it
   * undefined.
   */
  readonly reasoning?: string;
  /**
   * Optional provider-raw payload. Useful for debugging an LLM player —
   * the raw model response, token counts, etc. Opaque to `Session`.
   */
  readonly raw?: unknown;
}

/**
 * A single turn — the scene the player was shown and the decision they made.
 */
export interface Turn {
  /** The scene presented at this branch point. */
  readonly scene: Scene;
  /** The decision the player returned. */
  readonly decision: Decision;
}

/**
 * What `Session` passes to the Player on each turn.
 *
 * @remarks
 * `history` is the running list of completed turns *before* this one. Pass
 * it to the LLM as context, look at it in a heuristic player, or ignore it
 * entirely (as `ScriptedPlayer` does).
 *
 * In a future task, `persona` will join this shape — Player implementations
 * should accept additional context properties without breaking.
 */
export interface TurnContext {
  /** The scene presented at this branch point. */
  readonly scene: Scene;
  /** Turns that have already completed in this session. */
  readonly history: readonly Turn[];
}

/**
 * The Player contract.
 *
 * @remarks
 * Implementations may be synchronous or return a Promise — `Session`
 * always awaits the result.
 */
export interface Player {
  /**
   * Pick a choice for the current turn.
   *
   * @param ctx - The current scene plus running history.
   * @returns A {@link Decision}. Sync or async.
   */
  selectChoice(ctx: TurnContext): Promise<Decision> | Decision;
}
