<!--
Thanks for the PR! A few things to keep the loop tight — please fill in
the sections that apply and delete the rest. PRs should be small and
focused; if you're touching > 400 lines or > 3 directories, consider
splitting.
-->

## Summary

<!-- One or two sentences. What does this PR change, and why? -->

## Related

<!-- Link any issue, ADR, or discussion. Use "Closes #123" to auto-close on merge. -->

- Closes #
- ADR:

## ATDD evidence

<!--
poltergink is ATDD-first (see CONTRIBUTING.md). For any user-visible
behaviour change, an acceptance test should be added or updated. Link
the .feature file and step defs below.
-->

- [ ] Feature file: `features/...`
- [ ] Step defs:    `features/step_definitions/...`
- [ ] N/A — internal refactor or pure tooling change

## Changes

<!-- Bulleted list of the concrete deltas — what moved, what's new, what's gone. -->

-

## Checklist

- [ ] `pnpm verify` passes locally (pre-push hook should have run it)
- [ ] Public API surface has TSDoc on every new/changed export
- [ ] Changeset added (`pnpm changeset`) for user-facing changes
- [ ] If this is a new design decision worth recording — ADR added under `docs/decisions/`
- [ ] Commit messages follow the gitmoji + Conventional Commits format (see CONTRIBUTING.md)

## Notes for reviewers

<!-- Anything tricky, deliberate, or that you want a second pair of eyes on. -->
