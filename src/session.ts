/**
 * `Session` — the orchestrator that drives a {@link Story} through a
 * {@link Player}, turn by turn, until the story ends. Emits typed
 * {@link SessionEvent}s along the way and returns a {@link Transcript}.
 *
 * @remarks
 * Pattern: **Mediator** (owns the turn loop; the Story and the Player
 * never call each other directly) + **Observer** (event emitter).
 *
 * Loop shape:
 *
 * ```text
 * while not ended:
 *   scene  ← story.advance()
 *   if scene.ended: emit story:ended, return Transcript
 *   emit turn:start
 *   snap0  ← story.snapshot()
 *   decision ← await player.selectChoice({ scene, history })
 *   story.choose(decision.choiceIndex)
 *   snap1  ← story.snapshot()
 *   record TurnRecord
 *   emit choice:made
 * ```
 *
 * @packageDocumentation
 */

import type { Player, Turn } from "./player.ts";
import type { Scene, Story } from "./story.ts";
import type { Transcript, TurnRecord } from "./transcript.ts";

/**
 * The set of events `Session` emits. A discriminated union on `type`.
 */
export type SessionEvent =
  | { readonly type: "turn:start"; readonly turnIndex: number; readonly scene: Scene }
  | { readonly type: "choice:made"; readonly turnIndex: number; readonly record: TurnRecord }
  | { readonly type: "story:ended"; readonly finalScene: Scene };

/** Maps event-type strings to their event shape. */
export type SessionEventOf<T extends SessionEvent["type"]> = Extract<SessionEvent, { type: T }>;

/** Listener for a typed session event. */
export type SessionEventListener<T extends SessionEvent["type"]> = (
  event: SessionEventOf<T>,
) => void;

/**
 * Function returned by {@link Session.on} that, when called, removes the
 * listener it was returned for. Calling it twice is a no-op.
 */
export type SessionUnsubscribe = () => void;

/**
 * Thrown by {@link Session.run} when the configured `maxTurns` cap is hit.
 * Indicates either a runaway loop in the .ink source or a configuration
 * issue — the partial transcript is attached for debugging.
 */
export class SessionMaxTurnsError extends Error {
  constructor(
    /** The cap that was exceeded. */
    public readonly maxTurns: number,
    /** The partial transcript up to (but not including) the over-limit turn. */
    public readonly partial: Transcript,
  ) {
    super(`Session exceeded maxTurns=${maxTurns}`);
    this.name = "SessionMaxTurnsError";
  }
}

/**
 * Options for constructing a {@link Session}.
 */
export interface SessionOptions {
  /** The story to drive. */
  readonly story: Story;
  /** The player picking choices. */
  readonly player: Player;
  /**
   * Hard cap on the number of completed turns. If the loop is still
   * going at this count it throws {@link SessionMaxTurnsError} with the
   * partial transcript. Defaults to no cap. Useful when driving an
   * unfamiliar .ink that might loop, or as a safety net in tests.
   */
  readonly maxTurns?: number;
}

/**
 * Drives a story-player pair to completion.
 */
export class Session {
  readonly #story: Story;
  readonly #player: Player;
  readonly #maxTurns: number;
  // Stored as `(event: SessionEvent) => void` internally; the typed `on()`
  // wrapper guarantees each listener only ever receives events of the
  // type it was registered for.
  readonly #listeners = new Map<SessionEvent["type"], Set<(event: SessionEvent) => void>>();

  constructor(opts: SessionOptions) {
    this.#story = opts.story;
    this.#player = opts.player;
    this.#maxTurns = opts.maxTurns ?? Number.POSITIVE_INFINITY;
  }

  /**
   * Subscribe to a typed session event.
   *
   * @returns An unsubscribe function. Call it (zero or one time) to remove
   *   the listener.
   */
  on<T extends SessionEvent["type"]>(
    type: T,
    listener: SessionEventListener<T>,
  ): SessionUnsubscribe {
    let bucket = this.#listeners.get(type);
    if (!bucket) {
      bucket = new Set();
      this.#listeners.set(type, bucket);
    }
    // The listener accepts only the extracted event subtype. Storing it
    // as a SessionEvent-accepting function is sound because dispatch
    // routes by `event.type` — a listener only ever sees its own type.
    const erased = listener as unknown as (event: SessionEvent) => void;
    bucket.add(erased);
    return () => {
      bucket.delete(erased);
    };
  }

  #emit(event: SessionEvent): void {
    const bucket = this.#listeners.get(event.type);
    if (!bucket) return;
    // Listeners in this bucket were registered for `event.type` and so are
    // safely cast to a function over the union — TS can't narrow this for us.
    for (const listener of bucket) {
      (listener as (e: SessionEvent) => void)(event);
    }
  }

  /**
   * Run the story to completion.
   *
   * @returns A frozen {@link Transcript}.
   * @throws {@link SessionMaxTurnsError} if `maxTurns` was set and exceeded.
   * @throws Whatever the Player throws (e.g. `ScriptExhaustedError`).
   * @throws `StoryChoiceRangeError` if the player picks an out-of-range index.
   */
  async run(): Promise<Transcript> {
    const turns: TurnRecord[] = [];
    const completedTurns = (): readonly Turn[] => turns;

    while (true) {
      const scene = this.#story.advance();
      if (scene.ended || scene.choices.length === 0) {
        const finalSnapshot = this.#story.snapshot();
        this.#emit({ type: "story:ended", finalScene: scene });
        return Object.freeze({
          turns: Object.freeze(turns) as readonly TurnRecord[],
          finalScene: scene,
          finalSnapshot,
        });
      }

      if (turns.length >= this.#maxTurns) {
        const partial: Transcript = Object.freeze({
          turns: Object.freeze([...turns]) as readonly TurnRecord[],
          finalScene: scene,
          finalSnapshot: this.#story.snapshot(),
        });
        throw new SessionMaxTurnsError(this.#maxTurns, partial);
      }

      const turnIndex = turns.length;
      this.#emit({ type: "turn:start", turnIndex, scene });

      const snapshotBefore = this.#story.snapshot();
      const decision = await this.#player.selectChoice({
        scene,
        history: completedTurns(),
      });
      this.#story.choose(decision.choiceIndex);
      const snapshotAfter = this.#story.snapshot();

      const record: TurnRecord = Object.freeze({
        index: turnIndex,
        scene,
        decision,
        snapshotBefore,
        snapshotAfter,
      });
      turns.push(record);
      this.#emit({ type: "choice:made", turnIndex, record });
    }
  }
}
