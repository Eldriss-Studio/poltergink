# Security Policy

## Reporting a vulnerability

If you believe you've found a security issue in `poltergink`, please report it privately rather than opening a public GitHub issue.

- **Email:** yuri.flagrare@gmail.com
- **Subject line:** `[poltergink security] <short summary>`

Include:

1. A description of the issue and its impact.
2. A minimal reproduction (a `.ink` snippet or compiled `.json` plus the API call sequence is ideal).
3. The version of `poltergink` and Node you're running.
4. Any suggested fix, if you have one.

## What to expect

- **Acknowledgement** within 7 days.
- **Initial assessment** within 14 days, including a rough severity rating and target fix window.
- **Coordinated disclosure** up to 90 days. We'll keep you updated on progress and ask before publishing any acknowledgement that names you.

## Supported versions

While `poltergink` is pre-1.0, only the latest published version is supported for security fixes. Once 1.0 ships this policy will be updated to cover at least the current major.

## Scope

In scope:

- Vulnerabilities in `poltergink`'s own code (the library itself and its published examples).
- Issues in how `poltergink` invokes its direct dependencies that lead to a security impact for consumers.

Out of scope:

- Vulnerabilities in upstream dependencies (please report those to the upstream project; we'll coordinate with you on bumping).
- LLM-output safety issues unrelated to `poltergink`'s constrained-choice contract (those belong to the model provider).
- Hypothetical issues without a reproduction.
