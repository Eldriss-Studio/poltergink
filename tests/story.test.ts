import { describe, expect, it } from "vitest";
import { Story, StoryChoiceRangeError } from "../src/story.ts";

const SIMPLE_INK = `Hello, world.
* [Greet back]
  Greetings.
* [Stay silent]
  Silence.
`;

describe("Story.fromInk", () => {
  it("produces text and choices from raw .ink source", () => {
    const story = Story.fromInk(SIMPLE_INK);
    const scene = story.advance();

    expect(scene.text).toContain("Hello, world.");
    expect(scene.choices).toHaveLength(2);
    expect(scene.choices[0]?.text).toBe("Greet back");
    expect(scene.choices[1]?.text).toBe("Stay silent");
    expect(scene.canContinue).toBe(false);
    expect(scene.ended).toBe(false);
  });

  it("returns frozen Scene + Choice objects", () => {
    const story = Story.fromInk(SIMPLE_INK);
    const scene = story.advance();

    expect(Object.isFrozen(scene)).toBe(true);
    expect(Object.isFrozen(scene.choices)).toBe(true);
    expect(Object.isFrozen(scene.tags)).toBe(true);
    if (scene.choices.length > 0) {
      expect(Object.isFrozen(scene.choices[0]?.tags)).toBe(true);
    }
  });
});

describe("Story.choose", () => {
  it("advances past the chosen branch", () => {
    const story = Story.fromInk(SIMPLE_INK);
    story.advance();

    story.choose(0);
    const after = story.advance();

    expect(after.text).toContain("Greetings.");
    expect(after.choices).toHaveLength(0);
    expect(after.ended).toBe(true);
  });

  it("rejects an out-of-range index with StoryChoiceRangeError", () => {
    const story = Story.fromInk(SIMPLE_INK);
    story.advance();

    expect(() => story.choose(99)).toThrow(StoryChoiceRangeError);
    expect(() => story.choose(99)).toThrow(/out of range/);
  });

  it("rejects a negative index", () => {
    const story = Story.fromInk(SIMPLE_INK);
    story.advance();

    expect(() => story.choose(-1)).toThrow(StoryChoiceRangeError);
  });

  it("rejects a non-integer index", () => {
    const story = Story.fromInk(SIMPLE_INK);
    story.advance();

    expect(() => story.choose(0.5)).toThrow(StoryChoiceRangeError);
  });

  it("StoryChoiceRangeError carries the attempted and available counts", () => {
    const story = Story.fromInk(SIMPLE_INK);
    story.advance();

    try {
      story.choose(7);
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(StoryChoiceRangeError);
      expect((e as StoryChoiceRangeError).attempted).toBe(7);
      expect((e as StoryChoiceRangeError).available).toBe(2);
    }
  });
});

describe("Story.snapshot / restore", () => {
  it("round-trips state across a chosen branch", () => {
    const story = Story.fromInk(SIMPLE_INK);
    const pristine = story.snapshot();

    story.advance();
    story.choose(0);
    story.advance();
    expect(story.advance().ended).toBe(true);

    story.restore(pristine);
    const replay = story.advance();
    expect(replay.text).toContain("Hello, world.");
    expect(replay.choices).toHaveLength(2);
  });
});

describe("tags", () => {
  it("captures passage-level tags during advance", () => {
    const story = Story.fromInk(`The wind howls. # mood:tense # weather:storm
* [Hide]
  -> END
`);

    const scene = story.advance();
    expect(scene.tags).toContain("mood:tense");
    expect(scene.tags).toContain("weather:storm");
  });

  it("captures per-choice tags written before the bracketed text", () => {
    // Per inkjs, tags BEFORE [brackets] (or on bracketless choices) populate
    // Choice.tags; tags AFTER brackets apply to the post-choice content.
    const story = Story.fromInk(`A fork in the road.
* Take the left path # path:left # risk:low
  -> END
* Take the right path # path:right # risk:high
  -> END
`);

    const scene = story.advance();
    expect(scene.choices[0]?.tags).toEqual(["path:left", "risk:low"]);
    expect(scene.choices[1]?.tags).toEqual(["path:right", "risk:high"]);
  });

  it("surfaces tags after a bracketed choice as post-choice scene tags", () => {
    // The Director use case: a tag that fires only once the choice is taken.
    const story = Story.fromInk(`A fork in the road.
* [Take the left path] # consequence:wet
  You step into a puddle.
  -> END
`);

    const before = story.advance();
    expect(before.choices[0]?.tags).toEqual([]);

    story.choose(0);
    const after = story.advance();
    expect(after.tags).toContain("consequence:wet");
    expect(after.text).toContain("You step into a puddle");
  });
});
