/**
 * `poltergink` — an LLM-native TypeScript wrapper around inkjs.
 *
 * @remarks
 * The remaining public surface (`Player`, `Persona`, `Session`, `Transcript`)
 * lands in subsequent tasks. See
 * {@link https://github.com/Eldriss-Studio/poltergink | the repo} and the
 * ADRs under `docs/decisions/` for the design contract.
 *
 * @packageDocumentation
 */

export type { Decision, Player, Turn, TurnContext } from "./player.ts";
export { ScriptExhaustedError, ScriptedPlayer } from "./players/scripted.ts";
export { Session, type SessionOptions, type SessionResult } from "./session.ts";
export { type Choice, type Scene, Story, StoryChoiceRangeError } from "./story.ts";

/**
 * The library's version string. Bumped via Changesets at release time.
 */
export const VERSION = "0.0.0";
