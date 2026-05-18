# ADR-0001: Mission and scope of `poltergink`

- **Status:** Accepted
- **Date:** 2026-05-17
- **Deciders:** @flagrare
- **Supersedes:** —

## Context and Problem Statement

Inkle's [Ink](https://github.com/inkle/ink) is a one-sided narrative engine: an author writes branching prose, and a human player advances it by picking from author-defined choices via [`inkjs`](https://github.com/y-lohse/inkjs). Modern LLM apps tend to do the opposite — they generate unconstrained text and lose any sense of authored structure. We want a TypeScript library that puts an LLM into the *player* seat of a real Ink narrative, holds it to a persona, and forbids freeform generation. The library is called `poltergink` (poltergeist + Ink, Ghost-in-the-Shell flavor). This ADR records *what* we are building and the contract that future technical decisions must honor.

## Decision Drivers

- The library must be *narrative-faithful*: an LLM must never advance the story outside the author's choice graph.
- It must be *observable*: every turn — the scene shown, the persona acting, the choice picked, the model's reasoning, the pre/post story state — must be inspectable for debugging and replay.
- It must support *multiple personas* per session, including mid-session switching, so authors can model casts and scene-driven roles.
- It must be approachable for a TypeScript developer who knows Ink at the .ink-author level but is new to LLM tooling.
- The toolchain and docs are part of the deliverable, not afterthoughts.

## Considered Options

- **A: LLM-native Ink *player* library** — LLM picks choices, never writes text.
- **B: LLM-native Ink *author* library** — LLM generates branches and continuations on demand.
- **C: Hybrid (LLM author + player)** — LLM can both extend and play the story.

## Decision Outcome

**Chosen option: "A — LLM-native Ink player library."** It is the under-served slot in the ecosystem (no established inkjs+LLM player exists), it preserves authorial intent (Ink remains the source of truth), and it gives us a tight, verifiable contract — the LLM's output is reduced to an integer choice index, which is trivially testable.

### v0 in-scope

- Load `.ink` source (via inkjs's bundled `Compiler`) or pre-compiled `.json`.
- Advance the story, present `currentText`/`currentTags`/`currentChoices` to a player.
- Multiple `Player` strategies: an LLM player (constrained-output choice selection), a scripted player for tests, and a random baseline.
- Multi-persona sessions with tag-driven switching (`# persona:detective` in the .ink source).
- An immutable, structured `Transcript` of every turn — the observability backbone.
- A "really good docs" experience: quickstart, concepts, recipes, generated API reference.

### v0 out-of-scope (parked)

- LLM-as-author (writing new branches) and LLM-vs-LLM dialogue — option B/C territory; revisit post-v0.
- Visual playground / web UI.
- Story authoring tooling (we consume `.ink`, we don't help write it).
- Provider-specific advanced features (e.g., bespoke Anthropic prompt-cache wiring) beyond what a portable abstraction exposes.

### Consequences

- *Good:* The library has a sharp, single-purpose identity that's easy to explain and easy to test (choice-index outputs are deterministic-checkable).
- *Good:* Authored narratives remain the source of truth, which sidesteps the typical "LLM hallucinated a branch" failure mode.
- *Good:* Multi-persona + transcript turn the system into a debugging substrate for research on LLM decision-making under constraint.
- *Bad / accepted cost:* We cannot generate novel content at runtime, so authors who want emergent prose must look elsewhere (for now).
- *Bad / accepted cost:* Personas are constrained to the choices the author wrote; expressivity depends on the .ink graph's richness.

## Pros and Cons of the Options

### A: LLM player only
- *Good:* Greenfield, well-defined contract, trivially testable, faithful to authored intent.
- *Bad:* Bounded by what the author wrote; no emergent branches.

### B: LLM author
- *Good:* Unlimited expressivity, novel branches every session.
- *Bad:* Loses Ink's main value (authored structure); harder to test; an LLM-narrative-generation library is a crowded space.

### C: Hybrid
- *Good:* Most flexible long-term direction.
- *Bad:* Doubles surface area; muddies the v0 contract; defers shipping anything coherent.

## More Information

- Companion technical record: [ADR-0002: Bootstrap stack](./0002-bootstrap-stack.md).
