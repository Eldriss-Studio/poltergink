# Contributing to poltergink

Thanks for thinking about contributing. `poltergink` is an LLM-native player for [Ink](https://github.com/inkle/ink) narratives — see [ADR-0001](./docs/decisions/0001-mission-and-scope.md) for the mission and [ADR-0002](./docs/decisions/0002-bootstrap-stack.md) for the stack.

This guide covers what you need to know before opening a PR.

## Code of Conduct

This project follows the [Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Getting set up

Requirements:

- **Node** — version pinned in `.nvmrc` (run `nvm use` if you use `nvm`).
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate`.

Then:

```bash
pnpm install
pnpm verify   # the full local quality gate — same checks as CI
```

> *Note:* `pnpm verify` and the scripts it runs become available once task 1 (the scaffold) lands. Until then, this repo contains only the decision substrate and hygiene files.

## How we work — ATDD-first, Kent-style

`poltergink` is built **acceptance-test-driven**. The framework is **Vitest** with behaviour-named `describe` / `it` blocks (see [ADR-0003](./docs/decisions/0003-vitest-only-testing.md)). The workflow for any user-visible behaviour:

1. **Write the Vitest test first** under `tests/` (or co-located as `*.test.ts`), expressing the behaviour in the test name. Watch it fail.
2. **Implement** until the test passes.
3. **Refactor** — clean up naming, structure, duplication. Re-run.
4. **Gap review** — missing edge cases, untested paths, error shapes. Add tests for any gaps.
5. **Update docs** — at minimum TSDoc on any new exported symbol; recipes/concepts pages for new user-facing capability.

### What good tests look like here

- **Test through the public API.** Don't reach into private state. If a test needs to, the public API is missing something — fix the API first.
- **Default to integration over unit.** Use the real `Story` from a fixture `.ink`, the real `Session`, the real `Transcript`. Mock only at *external* boundaries (the LLM provider).
- **Name the behaviour, not the method.** `it("rejects an out-of-range choice index with StoryChoiceRangeError")` beats `it("choose throws")`.
- **Assert on contracts, not strings.** `expect(err).toBeInstanceOf(StoryChoiceRangeError)` and on its public properties — not `expect(err.message).toBe("…")`.
- **AHA over `beforeEach`.** Prefer an inline `setup()` factory returning sane defaults that each test overrides only where it differs.
- **Coverage is a smell detector, not a target.** 100% line coverage with no use-case coverage is worthless.

Tests that only exercise implementation details (private methods, internal state shapes, the order internal collaborators are called) are not welcome — they create refactor friction without giving real confidence.

## Commit messages

This repo follows the **Tardigrade-style gitmoji + Conventional Commits** convention used across [Eldriss-Studio](https://github.com/Eldriss-Studio) projects ([tardigrade-db reference](https://github.com/Eldriss-Studio/tardigrade-db/blob/main/CONTRIBUTING.md#commit-message-format)).

**Format:**

```
[emoji] type(scope): subject

[optional body]

[optional footer(s)]
```

The leading emoji is **mandatory**. Use the gitmoji that matches the change intent — see [gitmoji.dev](https://gitmoji.dev). Common pairings used in this project:

| Emoji | Type | When |
|---|---|---|
| ✨ | `feat` | new user-visible capability |
| 🐛 | `fix` | bug fix |
| 📝 | `docs` | documentation only |
| ♻️ | `refactor` | non-feature, non-fix code change |
| 🧪 | `test` | tests only |
| ⚡ | `perf` | performance change |
| 🧹 | `chore` | tidying / hygiene |
| 🔧 | `chore` | tooling, config, CI |
| 🔖 | `release` | version bump (via Changesets) |

**Subject style — a tight topical noun phrase, not an imperative sentence.** Treat the subject as a *label* for the change, not a description of what you did. The body is where you explain.

| Good | Avoid |
|---|---|
| `🐛 fix(bench/prep): LongMemEval gold` | `🐛 fix: corrected the LongMemEval gold dataset preprocessing step` |
| `🔧 chore(scaffold): TS project + quality gate` | `🔧 chore: scaffold TypeScript project with full quality stack` |
| `✨ feat(player): tag-driven persona switching` | `✨ feat: add support for switching personas based on Ink tags` |

**Examples:**

- `✨ feat(player): tag-driven persona switching`
- `🐛 fix(story): clamp out-of-range choice index`
- `📝 docs(adr): ADR-0003 supersede stack decision`
- `🧪 test(session): end-of-story edge case`
- `🧹 chore: knip unused-export cleanup`
- `🔧 chore(ci): pin actions/setup-node@v4`

Commitlint enforces both the leading emoji (any Extended_Pictographic codepoint, including ZWJ sequences) and the `type(scope): subject` shape on every commit message. Subjects over ~50 chars get a warning (not a block) — that's the punchy-noun-phrase nudge. The configured types are: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`, `revert`, `release`.

## Branching and PRs

- Branch from `main`. Name the branch `<type>/<short-slug>` (e.g., `feat/persona-tag-director`).
- Keep PRs small. One logical change per PR.
- All CI checks must be green. Coverage thresholds must be met. Public-API changes need a Changeset (`pnpm changeset`) describing the version bump and the user-facing impact.

## When to write an ADR

Write a new ADR when a change is **load-bearing** for future contributors — anything where future-you (or a code reviewer) would ask "why was this chosen?" and the answer isn't obvious from the code. Examples:

- Adopting or swapping a runtime dependency.
- Changing a public API contract.
- Picking between two architectural patterns.
- Deciding *not* to do something we've discussed.

Workflow:

1. Copy [`docs/decisions/template.md`](./docs/decisions/template.md) to `docs/decisions/NNNN-short-title.md` using the next sequential number.
2. Fill out the sections honestly — the Considered Options and Consequences are the bits that matter most.
3. Set `Status: Proposed` and open a PR. The ADR *is* the proposal; reviewers discuss it on the PR.
4. On merge, change `Status:` to `Accepted`.
5. If the ADR supersedes an existing one, update the old ADR's `Status:` to `Superseded by ADR-NNNN` and add a forward link.

The index in [`docs/decisions/README.md`](./docs/decisions/README.md) must be kept in sync.

## Reporting bugs and proposing features

Open a GitHub issue. For bugs, include a minimal `.ink` (or compiled `.json`) snippet that reproduces the problem and the exact `poltergink` API call sequence.

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities — please do **not** open a public issue for those.
