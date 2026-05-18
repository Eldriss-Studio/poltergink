# ADR-0002: Bootstrap stack for `poltergink`

- **Status:** Accepted (ATDD-framework choice superseded by [ADR-0003](./0003-vitest-only-testing.md); rest of the stack stands)
- **Date:** 2026-05-17
- **Deciders:** @flagrare
- **Supersedes:** —

## Context and Problem Statement

Given the mission set out in [ADR-0001](./0001-mission-and-scope.md) — an observable, narrative-faithful, multi-persona LLM player for Ink — we have to pick a coherent technology stack for v0 *before* writing any code. This ADR records that stack as one consolidated decision so subsequent material changes can each be a focused supersede. It focuses on the *choices* and *why*; the architecture (Facade/Strategy/State/Mediator+Observer) materialises as later commits across `src/`.

## Decision Drivers

- **Industry-standard, multi-vendor:** the user explicitly wants the LLM layer to work against cloud models *and* local ones (Ollama, LM Studio, vLLM). Single-vendor SDKs are disqualified for the core.
- **ATDD-first:** acceptance tests drive implementation. The test stack must support Gherkin-style behavior specs without grafting BDD onto a unit framework.
- **Quality gate is part of the product:** linting, formatting, dead-code detection, dual-ESM/CJS publish validation, pre-commit hooks, and CI must all be wired in from day one — not bolted on later.
- **Docs are part of the product:** the docs site must be modern, fast, and easy to extend; the API reference must be generated from TSDoc so it cannot rot.
- **Single source of truth for "all checks pass":** one `pnpm verify` script must run the exact same checks locally as CI.

## Considered Options (load-bearing axes)

### LLM abstraction
- **A: Vercel AI SDK (`ai`)** — multi-provider via first-party + community providers (Anthropic, OpenAI, Google, Ollama via `ollama-ai-provider`, LM Studio / vLLM via `@ai-sdk/openai-compatible`).
- **B: `@anthropic-ai/sdk` direct** — deepest single-vendor integration (grammar-constrained outputs, prompt caching), but Anthropic-only.
- **C: Hand-rolled adapter layer over multiple SDKs** — maximum flexibility, maximum maintenance.

### Lint + format
- **A: Biome** — single Rust binary for lint + format; fast; minimal config.
- **B: ESLint v9 (flat config) + Prettier** — bigger plugin ecosystem; slower; more config to maintain.

### ATDD framework
- **A: `@cucumber/cucumber`** — Gherkin features + TS step defs; only mature option in TS.
- **B: Vitest with `describe`/`it` reads-like-BDD** — not real Gherkin; loses the executable-spec contract.

### Build
- **A: `tsup` (esbuild)** — dual ESM/CJS + `.d.ts` in one zero-config command.
- **B: `tshy`** — tsc-based, slower, simpler if you want strict TS-only builds.
- **C: `unbuild`** — UnJS ecosystem; great if Nuxt-adjacent, otherwise unnecessary.

## Decision Outcome

**Chosen stack:**

| Concern | Choice | Package(s) |
|---|---|---|
| Ink runtime | inkjs (including its bundled `Compiler` for `.ink` source) | `inkjs` |
| LLM | Vercel AI SDK with `generateObject` + Zod | `ai`, `zod`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `ollama-ai-provider`, `@ai-sdk/openai-compatible` |
| ATDD | Cucumber.js with TS step defs | `@cucumber/cucumber`, `ts-node` |
| Unit tests | Vitest with V8 coverage | `vitest`, `@vitest/coverage-v8` |
| Build | `tsup` (dual ESM/CJS + d.ts) | `tsup` |
| Versioning + changelog | Changesets | `@changesets/cli` |
| Package manager | `pnpm` | — |
| Lint + format | Biome | `@biomejs/biome` |
| TSDoc validation | Minimal ESLint flat-config pass with `eslint-plugin-tsdoc` | `eslint`, `eslint-plugin-tsdoc` |
| Dead-code & dep audit | Knip | `knip` |
| Publish validation | Publint + `@arethetypeswrong/cli` | `publint`, `@arethetypeswrong/cli` |
| Pre-commit + commit-msg | Lefthook + Commitlint | `lefthook`, `@commitlint/cli`, `@commitlint/config-conventional` |
| Docs site | Astro Starlight | `astro`, `@astrojs/starlight` |
| API reference | TypeDoc | `typedoc` |
| Code-sample type-check | `tsd` | `tsd` |
| CI | GitHub Actions matrix (Node 20/22 × ubuntu/macos) + CodeQL | — |
| Dep updates | Renovate | — |

**Why this combination:**

- The **Vercel AI SDK** wins the LLM axis because it satisfies the multi-vendor driver — including local models — with a single `Player` integration point. Single-vendor SDKs (Option B) are disqualified by the local-LLM requirement; a hand-rolled adapter (Option C) is rejected as premature complexity.
- **Biome** wins lint+format because the speed and one-tool simplicity are worth more than ESLint's plugin breadth at this size of project; the one capability we lose (TSDoc syntax validation) is bought back cheaply with a minimal ESLint flat-config pass dedicated to `eslint-plugin-tsdoc`.
- **Cucumber.js** wins ATDD because it's the only mature Gherkin option in the TS ecosystem; Vitest stays as the unit-test runner *alongside* it, not as a replacement.
- **`tsup`** wins build because it ships dual ESM/CJS + types in one zero-config command, which is exactly what a publishable library needs at v0.

### Consequences

- *Good:* One `Player` integration point reaches every provider that matters (Anthropic, OpenAI, Gemini, Ollama, LM Studio, vLLM) without per-provider branches in core.
- *Good:* The quality gate (Biome + ESLint-TSDoc + Knip + Publint + attw + Lefthook + Commitlint + coverage thresholds) catches regressions before they reach CI, and CI catches anything the local hook missed.
- *Good:* Dual ESM/CJS output and validated `exports` map mean the library is consumable from any modern Node/bundler setup with no special instructions.
- *Bad / accepted cost:* We give up Anthropic-specific advanced features (e.g., bespoke prompt-cache wiring) unless we surface them through the AI SDK's escape hatches.
- *Bad / accepted cost:* Two test runners (Vitest + Cucumber) means two configs and two report formats — manageable, but it is overhead.
- *Bad / accepted cost:* Biome's narrower rule set means we lean on the minimal ESLint pass for TSDoc and may have to add more focused passes if other niche rules become important.

## Pros and Cons of the Options

### LLM abstraction
- **A: Vercel AI SDK** — *Good:* multi-provider including local, `generateObject` + Zod is ergonomic, large community. *Bad:* validation is post-generation in some providers; one more abstraction layer.
- **B: Anthropic SDK** — *Good:* true grammar-constrained outputs, prompt caching, deepest integration. *Bad:* Anthropic-only; rules out Ollama / LM Studio / vLLM.
- **C: Hand-rolled adapters** — *Good:* maximum control. *Bad:* maintenance burden, reinvents the AI SDK.

### Lint + format
- **A: Biome** — *Good:* fast, one tool, low config. *Bad:* narrower plugin ecosystem; no TSDoc rule.
- **B: ESLint + Prettier** — *Good:* breadth of plugins. *Bad:* slower, more config; two tools doing one job.

### ATDD framework
- **A: Cucumber.js** — *Good:* real Gherkin, executable specs are first-class. *Bad:* extra runner alongside Vitest.
- **B: Vitest BDD-shaped describes** — *Good:* one runner. *Bad:* loses the executable-spec contract; tests aren't behavior, they're code.

### Build
- **A: tsup** — *Good:* zero config, fast, dual format + types. *Bad:* esbuild-based, so very edge-case TS features may differ.
- **B: tshy** — *Good:* pure tsc, simplest semantics. *Bad:* slower, less polished publish helpers.
- **C: unbuild** — *Good:* UnJS ergonomics. *Bad:* unnecessary if we're not Nuxt-adjacent.

## More Information

- Mission and scope: [ADR-0001](./0001-mission-and-scope.md).
- Provider package references:
  - Vercel AI SDK — <https://ai-sdk.dev>
  - `ollama-ai-provider` — <https://github.com/sgomez/ollama-ai-provider>
  - `@ai-sdk/openai-compatible` — for LM Studio and vLLM
