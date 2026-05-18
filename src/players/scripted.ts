/**
 * `ScriptedPlayer` — a deterministic Player that picks from a pre-defined
 * sequence of choice indices. The workhorse for tests and reproducible
 * demos, and the reference implementation of the `Player` contract.
 *
 * @packageDocumentation
 */

import type { Decision, Player, TurnContext } from "../player.ts";

/**
 * Thrown by {@link ScriptedPlayer.selectChoice} when the story still wants
 * a decision but the script has been fully consumed.
 */
export class ScriptExhaustedError extends Error {
  constructor(
    /** How many entries the script started with. */
    public readonly scriptLength: number,
    /** Which zero-based turn was being requested when the script ran out. */
    public readonly turnIndex: number,
  ) {
    super(
      `Scripted player ran out of choices: script had ${scriptLength} entries but turn ${turnIndex} needs another decision`,
    );
    this.name = "ScriptExhaustedError";
  }
}

/**
 * A Player that walks a fixed list of choice indices.
 *
 * @example
 * ```ts
 * const player = new ScriptedPlayer([0, 1, 0]);
 * const session = new Session({ story, player });
 * await session.run();
 * ```
 *
 * Out-of-range indices are not the player's concern — they're rejected at
 * `Story.choose` time and surface as `StoryChoiceRangeError`.
 */
export class ScriptedPlayer implements Player {
  readonly #script: readonly number[];
  #cursor = 0;

  /**
   * @param script - The choice indices to play, in order.
   */
  constructor(script: readonly number[]) {
    this.#script = script;
  }

  selectChoice(_ctx: TurnContext): Decision {
    const idx = this.#cursor;
    if (idx >= this.#script.length) {
      throw new ScriptExhaustedError(this.#script.length, idx);
    }
    const choiceIndex = this.#script[idx] as number;
    this.#cursor += 1;
    return { choiceIndex };
  }
}
