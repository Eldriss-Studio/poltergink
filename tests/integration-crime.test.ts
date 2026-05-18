/**
 * Real-game integration test against `game-refs/crime.ink` (Inkle's
 * crime-scene example from "Writing with Ink"). Drives the story
 * through the always-pick-first-choice strategy, capped at 50 turns
 * for safety, and asserts on the shape and replay-safety of the
 * resulting Transcript.
 *
 * This is the canonical "does poltergink work on real authored
 * content?" test. Per docs/testing-philosophy.md it sits at the top
 * of the Trophy: real Story, real Session, real .ink, no mocks.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import type { Player } from "../src/player.ts";
import { Session } from "../src/session.ts";
import { Story } from "../src/story.ts";
import type { Transcript } from "../src/transcript.ts";

const CRIME_INK_PATH = fileURLToPath(new URL("../game-refs/crime.ink", import.meta.url));
const CRIME_SOURCE = readFileSync(CRIME_INK_PATH, "utf8");

const alwaysFirst: Player = {
  selectChoice: () => ({ choiceIndex: 0 }),
};

describe("integration: crime.ink (always-first-choice)", () => {
  let transcript: Transcript;

  beforeAll(async () => {
    const story = Story.fromInk(CRIME_SOURCE);
    const session = new Session({ story, player: alwaysFirst, maxTurns: 50 });
    transcript = await session.run();
  });

  it("produces a non-empty Transcript and a finalSnapshot", () => {
    expect(transcript.turns.length).toBeGreaterThan(0);
    expect(transcript.finalSnapshot.length).toBeGreaterThan(0);
  });

  it("every turn has both snapshots and at least one choice that was decidable", () => {
    for (const turn of transcript.turns) {
      expect(turn.snapshotBefore.length).toBeGreaterThan(0);
      expect(turn.snapshotAfter.length).toBeGreaterThan(0);
      expect(turn.scene.choices.length).toBeGreaterThan(0);
      expect(turn.decision.choiceIndex).toBe(0);
    }
  });

  it("any turn's snapshotBefore is round-trippable to replay from that turn", () => {
    const target = transcript.turns[2];
    if (!target) return; // story might end early; assertion needs depth

    const fresh = Story.fromInk(CRIME_SOURCE);
    fresh.restore(target.snapshotBefore);
    const replayed = fresh.advance();

    expect(replayed.choices.map((c) => c.text)).toEqual(target.scene.choices.map((c) => c.text));
  });

  it("emits the right event tape during the run", async () => {
    const events: string[] = [];
    const story = Story.fromInk(CRIME_SOURCE);
    const session = new Session({ story, player: alwaysFirst, maxTurns: 50 });
    session.on("turn:start", () => events.push("start"));
    session.on("choice:made", () => events.push("made"));
    session.on("story:ended", () => events.push("end"));

    await session.run();

    // Every turn produces start+made; one trailing end.
    const startCount = events.filter((e) => e === "start").length;
    const madeCount = events.filter((e) => e === "made").length;
    const endCount = events.filter((e) => e === "end").length;

    expect(startCount).toBeGreaterThan(0);
    expect(startCount).toBe(madeCount);
    expect(endCount).toBe(1);
    expect(events[events.length - 1]).toBe("end");
  });
});
