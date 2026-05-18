import { describe, expect, it } from "vitest";
import { ScriptExhaustedError, ScriptedPlayer } from "../src/players/scripted.ts";
import { Session } from "../src/session.ts";
import { Story } from "../src/story.ts";

const CROSSROADS_INK = `
You stand at a crossroads.
* [Go north] -> forest
* [Go south] -> river

=== forest ===
You enter a forest.
* [Climb a tree]
  You see the horizon. -> END
* [Rest under a tree]
  You fall asleep. -> END

=== river ===
You reach a river. -> END
`;

function setup(opts: { script: readonly number[] }) {
  const story = Story.fromInk(CROSSROADS_INK);
  const player = new ScriptedPlayer(opts.script);
  const session = new Session({ story, player });
  return { story, player, session };
}

describe("ScriptedPlayer", () => {
  it("returns each scripted index in order on successive turns", async () => {
    const { session } = setup({ script: [0, 0] });
    const result = await session.run();

    expect(result.turns.map((t) => t.decision.choiceIndex)).toEqual([0, 0]);
  });

  it("rejects with ScriptExhaustedError when the script runs out mid-story", async () => {
    const { session } = setup({ script: [0] });

    await expect(session.run()).rejects.toBeInstanceOf(ScriptExhaustedError);
  });

  it("ScriptExhaustedError carries the script length and the turn index it failed at", async () => {
    const player = new ScriptedPlayer([0]);
    const story = Story.fromInk(CROSSROADS_INK);
    const session = new Session({ story, player });

    try {
      await session.run();
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ScriptExhaustedError);
      expect((e as ScriptExhaustedError).scriptLength).toBe(1);
      expect((e as ScriptExhaustedError).turnIndex).toBe(1);
    }
  });
});

describe("Session", () => {
  describe("driving a story with a ScriptedPlayer", () => {
    it("walks the script and returns turns + a final scene", async () => {
      const { session } = setup({ script: [0, 0] });
      const result = await session.run();

      expect(result.turns).toHaveLength(2);
      expect(result.finalScene.ended).toBe(true);
      expect(result.finalScene.text).toContain("horizon");
    });

    it("records each turn with the scene the player saw and the decision made", async () => {
      const { session } = setup({ script: [1] });
      const result = await session.run();

      expect(result.turns).toHaveLength(1);
      expect(result.turns[0]?.scene.choices.map((c) => c.text)).toEqual(["Go north", "Go south"]);
      expect(result.turns[0]?.decision.choiceIndex).toBe(1);
      expect(result.finalScene.text).toContain("river");
    });

    it("passes the running history to the player on every turn", async () => {
      const observed: number[] = [];
      const recorder = {
        selectChoice(ctx: { history: readonly { decision: { choiceIndex: number } }[] }) {
          observed.push(ctx.history.length);
          return { choiceIndex: 0 };
        },
      };
      const story = Story.fromInk(CROSSROADS_INK);
      const session = new Session({ story, player: recorder });
      await session.run();

      // Two turns; the player should have seen history lengths [0, 1].
      expect(observed).toEqual([0, 1]);
    });

    it("stops at the first scene with no choices and no canContinue", async () => {
      const { session } = setup({ script: [1] });
      const result = await session.run();

      expect(result.finalScene.ended).toBe(true);
      expect(result.finalScene.choices).toHaveLength(0);
    });
  });

  describe("error propagation", () => {
    it("surfaces errors thrown by the Player as-is", async () => {
      const oops = new Error("player blew up");
      const angry = {
        selectChoice() {
          throw oops;
        },
      };
      const story = Story.fromInk(CROSSROADS_INK);
      const session = new Session({ story, player: angry });

      await expect(session.run()).rejects.toBe(oops);
    });

    it("propagates StoryChoiceRangeError when the player picks an out-of-range index", async () => {
      const { session } = setup({ script: [99] });

      await expect(session.run()).rejects.toThrow(/out of range/);
    });
  });

  describe("zero-turn story", () => {
    it("returns no turns and a final scene with the full text", async () => {
      const story = Story.fromInk("It was all over before it began. -> END\n");
      const player = new ScriptedPlayer([]);
      const session = new Session({ story, player });
      const result = await session.run();

      expect(result.turns).toHaveLength(0);
      expect(result.finalScene.ended).toBe(true);
      expect(result.finalScene.text).toContain("all over");
    });
  });
});
