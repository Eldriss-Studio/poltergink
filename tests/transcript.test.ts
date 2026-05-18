import { describe, expect, it } from "vitest";
import { ScriptedPlayer } from "../src/players/scripted.ts";
import { Session, type SessionEvent, SessionMaxTurnsError } from "../src/session.ts";
import { Story } from "../src/story.ts";

const TWO_TURN_INK = `
You stand at a crossroads.
* [Go north] -> forest
* [Go south] -> river

=== forest ===
You enter a forest.
* [Climb] -> END
* [Rest]  -> END

=== river ===
You reach a river. -> END
`;

function setup(opts: { script: readonly number[]; maxTurns?: number }) {
  const story = Story.fromInk(TWO_TURN_INK);
  const player = new ScriptedPlayer(opts.script);
  const session = new Session(
    opts.maxTurns !== undefined ? { story, player, maxTurns: opts.maxTurns } : { story, player },
  );
  return { story, player, session };
}

describe("Session events", () => {
  it("fires turn:start before the player is called and choice:made after", async () => {
    const events: string[] = [];
    const { session } = setup({ script: [0, 0] });

    session.on("turn:start", (e) => events.push(`turn:start#${e.turnIndex}`));
    session.on("choice:made", (e) =>
      events.push(`choice:made#${e.turnIndex}=${e.record.decision.choiceIndex}`),
    );
    session.on("story:ended", () => events.push("story:ended"));

    await session.run();

    expect(events).toEqual([
      "turn:start#0",
      "choice:made#0=0",
      "turn:start#1",
      "choice:made#1=0",
      "story:ended",
    ]);
  });

  it("fires story:ended exactly once per run", async () => {
    let endedCount = 0;
    const { session } = setup({ script: [1] });
    session.on("story:ended", () => endedCount++);

    await session.run();

    expect(endedCount).toBe(1);
  });

  it("on() returns an unsubscribe that stops further notifications", async () => {
    let count = 0;
    const { session } = setup({ script: [0, 0] });

    const unsubscribe = session.on("turn:start", () => count++);
    unsubscribe();

    await session.run();

    expect(count).toBe(0);
  });

  it("supports multiple listeners on the same event type", async () => {
    let a = 0;
    let b = 0;
    const { session } = setup({ script: [0, 0] });

    session.on("turn:start", () => a++);
    session.on("turn:start", () => b++);

    await session.run();

    expect(a).toBe(2);
    expect(b).toBe(2);
  });

  it("choice:made carries the full TurnRecord including snapshots", async () => {
    const { session } = setup({ script: [1] });
    let captured: Extract<SessionEvent, { type: "choice:made" }> | undefined;
    session.on("choice:made", (e) => {
      captured = e;
    });

    await session.run();

    expect(captured).toBeDefined();
    expect(captured?.record.index).toBe(0);
    expect(captured?.record.decision.choiceIndex).toBe(1);
    expect(typeof captured?.record.snapshotBefore).toBe("string");
    expect(typeof captured?.record.snapshotAfter).toBe("string");
    expect(captured?.record.snapshotBefore).not.toBe(captured?.record.snapshotAfter);
  });
});

describe("Transcript snapshots", () => {
  it("captures snapshotBefore and snapshotAfter for every turn", async () => {
    const { session } = setup({ script: [0, 0] });
    const transcript = await session.run();

    expect(transcript.turns).toHaveLength(2);
    for (const turn of transcript.turns) {
      expect(typeof turn.snapshotBefore).toBe("string");
      expect(typeof turn.snapshotAfter).toBe("string");
      expect(turn.snapshotBefore.length).toBeGreaterThan(0);
      expect(turn.snapshotAfter.length).toBeGreaterThan(0);
    }
  });

  it("snapshotBefore round-trips so a fresh story can replay from that turn", async () => {
    const { session } = setup({ script: [0, 0] });
    const transcript = await session.run();

    const target = transcript.turns[1];
    expect(target).toBeDefined();
    if (!target) return;

    // Replay from the second turn's snapshotBefore: a fresh story restored
    // to that snapshot, then advanced, should see the same choices the
    // original second turn saw.
    const fresh = Story.fromInk(TWO_TURN_INK);
    fresh.restore(target.snapshotBefore);
    const replayed = fresh.advance();

    expect(replayed.choices.map((c) => c.text)).toEqual(target.scene.choices.map((c) => c.text));
  });

  it("finalSnapshot restores to the ended state", async () => {
    const { session } = setup({ script: [1] });
    const transcript = await session.run();

    const fresh = Story.fromInk(TWO_TURN_INK);
    fresh.restore(transcript.finalSnapshot);
    const scene = fresh.advance();

    expect(scene.ended).toBe(true);
    expect(scene.choices).toHaveLength(0);
  });

  it("freezes the Transcript and each TurnRecord", async () => {
    const { session } = setup({ script: [0, 0] });
    const transcript = await session.run();

    expect(Object.isFrozen(transcript)).toBe(true);
    expect(Object.isFrozen(transcript.turns)).toBe(true);
    for (const turn of transcript.turns) {
      expect(Object.isFrozen(turn)).toBe(true);
    }
  });
});

describe("Session maxTurns", () => {
  it("throws SessionMaxTurnsError when the cap is reached", async () => {
    const { session } = setup({ script: [0, 0, 0, 0], maxTurns: 1 });

    await expect(session.run()).rejects.toBeInstanceOf(SessionMaxTurnsError);
  });

  it("the error carries the partial Transcript up to the cap", async () => {
    const { session } = setup({ script: [0, 0, 0, 0], maxTurns: 1 });

    try {
      await session.run();
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(SessionMaxTurnsError);
      const err = e as SessionMaxTurnsError;
      expect(err.maxTurns).toBe(1);
      expect(err.partial.turns).toHaveLength(1);
      expect(err.partial.turns[0]?.decision.choiceIndex).toBe(0);
    }
  });

  it("no cap by default — completes a normal story", async () => {
    const { session } = setup({ script: [0, 0] });
    const transcript = await session.run();

    expect(transcript.turns).toHaveLength(2);
    expect(transcript.finalScene.ended).toBe(true);
  });
});
