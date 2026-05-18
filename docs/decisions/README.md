# Architecture Decision Records

This directory holds the project's Architecture Decision Records (ADRs) in the [MADR 3.0](https://adr.github.io/madr/) format. Each ADR captures one significant decision — the context, the options weighed, the chosen outcome, and the consequences. ADRs are append-only: when a decision changes, write a new ADR that supersedes the old one rather than rewriting history. Update the superseded record's `Status:` to `Superseded by ADR-NNNN` and link forward.

## Index

| ID | Status | Title |
|---|---|---|
| [0001](./0001-mission-and-scope.md) | Accepted | Mission and scope of `poltergink` |
| [0002](./0002-bootstrap-stack.md) | Accepted (ATDD framework superseded by 0003) | Bootstrap stack for `poltergink` |
| [0003](./0003-vitest-only-testing.md) | Accepted | Vitest-only testing, Kent C. Dodds–style |

## Adding a new ADR

1. Copy [`template.md`](./template.md) to `NNNN-short-title.md` using the next sequential number.
2. Fill out the sections. Start with `Status: Proposed`.
3. Open a PR. Discussion happens on the PR.
4. On merge, flip `Status:` to `Accepted` and update this index.
5. If the new ADR supersedes an existing one, update the old ADR's `Status:` to `Superseded by ADR-NNNN` and add a forward link.

The full template is at [`template.md`](./template.md).
