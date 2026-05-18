/**
 * `Story` — thin facade over {@link https://github.com/y-lohse/inkjs | inkjs}.
 *
 * @remarks
 * Pattern: **Facade**. Hides inkjs ceremony and exposes only what an
 * LLM-driven loop needs: load a narrative (from raw `.ink` source or
 * compiled JSON), advance it, pick a choice, snapshot/restore state.
 *
 * See {@link Story.fromInk}, {@link Story.fromJson}, {@link Story.advance},
 * {@link Story.choose}, {@link Story.snapshot}, {@link Story.restore}.
 *
 * @packageDocumentation
 */

import { Compiler, Story as InkStory } from "inkjs/full";

/**
 * A single choice presented to the player at a branch point.
 */
export interface Choice {
  /** Zero-based index, stable for the current scene. */
  readonly index: number;
  /** The rendered choice text the author wrote. */
  readonly text: string;
  /**
   * Per-choice tags visible at decision time — e.g. `# persona:detective`
   * on a choice an author wants the Director to route by.
   *
   * @remarks
   * Inkjs only populates this when the tag is written *before* the choice's
   * bracketed text, or when the choice has no brackets at all:
   *
   * ```ink
   * * Take the left path # path:left   // populates Choice.tags
   * * # path:right [Take the right] -> // populates Choice.tags
   * * [Take a third] # consequence     // does NOT — applies post-choice
   * ```
   *
   * Tags after a bracketed choice line apply to the *post-choice content*
   * and surface in {@link Scene.tags} on the next {@link Story.advance}.
   */
  readonly tags: readonly string[];
}

/**
 * The state of the story at a single turn — everything a player needs to
 * decide what to do next.
 */
export interface Scene {
  /** Accumulated text since the last advance. May be empty at the end. */
  readonly text: string;
  /** Tags emitted by passages traversed during this advance. */
  readonly tags: readonly string[];
  /** Choices the player can pick from. Empty when the story has ended. */
  readonly choices: readonly Choice[];
  /** True if the story has more unconditional text to produce. */
  readonly canContinue: boolean;
  /** True when there is no more text and no more choices. Terminal. */
  readonly ended: boolean;
}

/**
 * Thrown by {@link Story.choose} when the index is outside `[0, choices.length)`.
 */
export class StoryChoiceRangeError extends RangeError {
  constructor(
    /** The index the caller passed. */
    public readonly attempted: number,
    /** How many choices were available at the time. */
    public readonly available: number,
  ) {
    super(`Choice index ${attempted} is out of range (0..${available - 1})`);
    this.name = "StoryChoiceRangeError";
  }
}

/**
 * Facade over an `inkjs.Story`. Construct via {@link Story.fromInk} or
 * {@link Story.fromJson} — the constructor is private.
 */
export class Story {
  /**
   * Compile raw `.ink` source and wrap the resulting story.
   *
   * @param source - The full text of an `.ink` file.
   * @throws If the source has compile errors. The thrown error's message
   *   contains the inkjs compiler diagnostics.
   */
  static fromInk(source: string): Story {
    const compiler = new Compiler(source);
    const inkStory = compiler.Compile();
    return new Story(inkStory);
  }

  /**
   * Wrap a pre-compiled inkjs story (output of `inklecate` or
   * `new Compiler(source).Compile().ToJson()`).
   *
   * @param json - The compiled story as a JSON string.
   */
  static fromJson(json: string): Story {
    return new Story(new InkStory(json));
  }

  private constructor(private readonly inner: InkStory) {}

  /**
   * Drive the narrative forward by running all unconditional passages
   * until the next branch point (or the end).
   *
   * @returns A {@link Scene} with the accumulated text, tags, and the
   *   choices the next caller has to pick from.
   */
  advance(): Scene {
    const textParts: string[] = [];
    const tags: string[] = [];

    while (this.inner.canContinue) {
      textParts.push(this.inner.Continue() ?? "");
      const stepTags = this.inner.currentTags;
      if (stepTags) {
        tags.push(...stepTags);
      }
    }

    const choices: Choice[] = this.inner.currentChoices.map((c) => ({
      index: c.index,
      text: c.text,
      tags: Object.freeze([...(c.tags ?? [])]),
    }));

    const canContinue = this.inner.canContinue;
    const ended = !canContinue && choices.length === 0;

    return Object.freeze({
      text: textParts.join(""),
      tags: Object.freeze(tags),
      choices: Object.freeze(choices),
      canContinue,
      ended,
    });
  }

  /**
   * Pick a choice by its index.
   *
   * @param index - Zero-based, must be `< currentChoices.length`.
   * @throws {@link StoryChoiceRangeError} if `index` is out of range.
   */
  choose(index: number): void {
    const available = this.inner.currentChoices.length;
    if (!Number.isInteger(index) || index < 0 || index >= available) {
      throw new StoryChoiceRangeError(index, available);
    }
    this.inner.ChooseChoiceIndex(index);
  }

  /**
   * Serialize the story's full state — variables, call stack, visit counts,
   * current position — as a JSON string.
   *
   * @returns A string suitable for passing to {@link Story.restore}.
   */
  snapshot(): string {
    return this.inner.state.ToJson();
  }

  /**
   * Replace the story's state with a previous {@link Story.snapshot}.
   *
   * @param json - A snapshot string produced by {@link Story.snapshot}.
   */
  restore(json: string): void {
    this.inner.state.LoadJson(json);
  }
}
