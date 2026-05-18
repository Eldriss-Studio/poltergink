/**
 * `Session` — the orchestrator that drives a {@link Story} through a
 * {@link Player}, turn by turn, until the story ends.
 *
 * @remarks
 * Pattern: **Mediator**. Owns the turn loop; the Story and the Player
 * never call each other directly. The loop is:
 *
 * ```text
 * while not ended:
 *   scene  ← story.advance()        // drain all unconditional text
 *   if scene.ended: stop
 *   decision ← await player.selectChoice({ scene, history })
 *   story.choose(decision.choiceIndex)
 *   record turn
 * ```
 *
 * The result is a {@link SessionResult} with the full list of turns plus
 * the final scene (which is reached after the last decision and has no
 * choices left). The Transcript model in a follow-up task will enrich this
 * with snapshots and emitted events.
 *
 * @packageDocumentation
 */

import type { Player, Turn } from "./player.ts";
import type { Scene, Story } from "./story.ts";

/**
 * Options for constructing a {@link Session}.
 */
export interface SessionOptions {
  /** The story to drive. */
  readonly story: Story;
  /** The player picking choices. */
  readonly player: Player;
}

/**
 * The outcome of {@link Session.run}.
 */
export interface SessionResult {
  /** Every turn taken, in order. */
  readonly turns: readonly Turn[];
  /**
   * The story's final scene — reached after the last decision. Has
   * `ended === true` for a normal completion. Useful for displaying
   * the closing narrative without re-advancing the story.
   */
  readonly finalScene: Scene;
}

/**
 * Drives a story-player pair to completion.
 */
export class Session {
  readonly #story: Story;
  readonly #player: Player;

  constructor(opts: SessionOptions) {
    this.#story = opts.story;
    this.#player = opts.player;
  }

  /**
   * Run the story to completion.
   *
   * @returns The list of completed turns plus the final scene.
   * @throws Whatever the Player throws (e.g. `ScriptExhaustedError`).
   * @throws `StoryChoiceRangeError` if the player picks an out-of-range index.
   */
  async run(): Promise<SessionResult> {
    const turns: Turn[] = [];

    while (true) {
      const scene = this.#story.advance();
      if (scene.ended || scene.choices.length === 0) {
        return Object.freeze({ turns: Object.freeze(turns), finalScene: scene });
      }
      const decision = await this.#player.selectChoice({
        scene,
        history: turns,
      });
      this.#story.choose(decision.choiceIndex);
      turns.push({ scene, decision });
    }
  }
}
