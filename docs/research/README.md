# Research log

External research conducted for this project. Each entry credits the sources it leaned on (papers, vendor docs, engineering blogs, open-source projects) and links forward to where the findings landed — typically an ADR, a piece of code, or a documentation page. Together with the [decision records](../decisions/README.md), this is the project's complete answer to "why was it built this way?"

Decisions live in `docs/decisions/`. The evidence base for those decisions lives here.

## Scope

The catalog only documents research **relevant to poltergink's premise** — LLM personas, Ink narrative engines, agent design, memory systems, narrative-choice models. Research done to inform dev tooling (commit conventions, testing frameworks, changelog style, etc.) belongs with the tooling itself, not here.

## Sessions

| Date | Topic | Triggered by | Informed |
|------|-------|--------------|----------|
| 2026-05-18 | [LLM persona instruction best practices](./2026-05-18-llm-persona-best-practices.md) | Task #6 (Persona + PersonaDirector) | `Persona` type design (pending) |
| 2026-05-18 | [Ink narrative event emission patterns](./2026-05-18-ink-narrative-event-patterns.md) | Project Ares review surfaced that persona memory should record consequences, not just choices | `NarrativeEvent` API surface (pending); `EpisodicMemory` shape (pending) |
| 2026-05-18 | [Emotion and episodic memory in LLM personas](./2026-05-18-llm-persona-emotion-and-memory.md) | Static persona model from the first research was missing the dynamic dimensions (mood, memory of past events) that shape decisions across turns | `PersonaState`, `EmotionalState`, `MemoryStore` interface (all pending) |

## Template

[`template.md`](./template.md) shows the shape of a research entry. Copy it when starting a new session.

## How entries get created

This log is maintained as research happens. When external sources (vendor docs, papers, blog posts, open-source repos) inform a design decision, a session file lands here and the row above links it to whatever it informed. The goal is two-way traceability: from any ADR you can reach the research that justified it, and from any research entry you can reach the decision it shaped.
