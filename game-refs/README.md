# Game references

Reference `.ink` sources used as integration-test fixtures and as starting points for the runnable examples. These are **upstream samples from Inkle**, not part of `poltergink`'s own source code.

| File | Origin | Notes |
|---|---|---|
| [`intercept.ink`](./intercept.ink) | Inkle — *The Intercept* | Canonical Ink demo. Conversation-driven interrogation with `forceful`/`evasive` tracking. ~100 KB. |
| [`crime.ink`](./crime.ink) | Inkle — "Writing with Ink" chapter on Lists | Long crime-scene investigation. Heavy use of `LIST` features. |
| [`overboard.ink`](./overboard.ink) | Inkle — simplified pontoon from *Overboard!* | A reduction of the card-game mechanic from the commercial game. |
| [`sorcery.ink`](./sorcery.ink) | Inkle — Sorcery!-style dice mechanic | Demonstrates `LIST`-based dice / state. |

## License

These files are part of the [inkle/ink](https://github.com/inkle/ink) project, released under the **MIT License**. See <https://github.com/inkle/ink/blob/master/LICENSE.txt> for the full text. The copyright remains with Inkle Ltd.

## Why they live in the repo

- **Integration tests** in `tests/` run the full `Story` × `Session` loop against these real authored narratives. That's the strongest "does the library actually work on real content?" signal we have.
- **Examples** (under `examples/`, when they land) use these as drop-in stories so contributors can see `poltergink` driving a recognisable Inkle title rather than a toy stub.

## What's not in here

These are *not* packaged with the published `poltergink` npm tarball. Only `dist/`, `README.md`, `LICENSE`, and `CHANGELOG.md` ship (see the `files` field in `package.json`). Consumers who want to play with the references can clone the repo or pull them from upstream directly.
