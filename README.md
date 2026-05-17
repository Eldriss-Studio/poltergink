# poltergink

> A *poltergeist* in the *Ink* shell — an LLM-native TypeScript wrapper around [inkjs](https://github.com/y-lohse/inkjs).

<!--
Badges (enable once the corresponding infra exists):

[![CI](https://github.com/flagrare/poltergink/actions/workflows/ci.yml/badge.svg)](https://github.com/flagrare/poltergink/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/poltergink.svg)](https://www.npmjs.com/package/poltergink)
[![bundle size](https://img.shields.io/bundlephobia/minzip/poltergink)](https://bundlephobia.com/package/poltergink)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
-->

`poltergink` makes Inkle's [Ink](https://github.com/inkle/ink) narrative engine **two-sided**: instead of a human picking branches, an LLM holds a persona, reads the unfolding story, and is *forced* to pick from the author-defined `currentChoices`. No freeform text, no off-script generation — just constrained choice selection over a real narrative graph.

> **Status:** Pre-alpha. Bootstrapping in progress. The repo currently contains only the decision substrate (ADRs) and hygiene files — code lands with task 1 of the [bootstrap plan](./docs/decisions/0002-bootstrap-stack.md).

## Design references

- **[ADR-0001 — Mission and scope](./docs/decisions/0001-mission-and-scope.md)** — what `poltergink` is, the contract it honors, and what is in / out of scope for v0. **Start here.**
- **[ADR-0002 — Bootstrap stack](./docs/decisions/0002-bootstrap-stack.md)** — the consolidated technical bootstrap: LLM abstraction (Vercel AI SDK), ATDD (Cucumber.js + Vitest), build (`tsup`), lint (Biome), docs (Astro Starlight), and the full quality gate.
- **[Decision records index](./docs/decisions/README.md)** — all ADRs and how to add one.

## Roadmap (v0)

See ADR-0002 (and the appended Task-0 sub-plan in the planning notes) for the full ATDD-first phased build. Headline pieces:

1. `Story` facade over `inkjs` + its `Compiler` (supports both `.ink` and `.json`)
2. `Player` strategy with `LLMPlayer` (Vercel AI SDK + Zod), `ScriptedPlayer`, `RandomPlayer`
3. `Persona` + `PersonaDirector` with tag-driven switching (`# persona:detective`)
4. `Session` orchestrator with an observable `Transcript` and typed events
5. Astro Starlight docs site with TypeDoc-generated API reference

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the ATDD-first workflow, commit conventions, and the **ADR process** for proposing or recording a load-bearing decision. Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). Security issues: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Yuri Flagrare.
