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

## How we work — ATDD-first

`poltergink` is built **acceptance-test-driven**. For any user-visible behavior:

1. **Write the Gherkin feature first** under `features/`, expressing the behavior in Given/When/Then. Watch it fail.
2. **Implement** until the feature is green.
3. **Add unit tests** (Vitest) for the seams worth pinning down at a finer grain.
4. **Update docs** — at minimum a TSDoc comment on any new exported symbol; recipes/concepts pages for new user-facing capability.

Unit tests alone are not a substitute for an acceptance test. If your change has no behavior worth describing in Gherkin, the change is probably either internal refactor (no new tests needed beyond keeping existing ones green) or too small to need a PR.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Common prefixes:

- `feat:` — new user-visible capability
- `fix:` — bug fix
- `docs:` — docs-only change
- `chore:` — repo plumbing
- `refactor:` — code change without behavior change
- `test:` — tests only
- `perf:` — performance change

Commitlint enforces this once task 1 lands.

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
