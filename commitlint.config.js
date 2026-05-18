/**
 * Tardigrade-style gitmoji + Conventional Commits.
 *
 * Format: `[emoji] type(scope): subject`
 *
 *   ✨ feat(player):    new capability for a user
 *   🐛 fix(story):      bug fix
 *   📝 docs(adr):       documentation only
 *   ♻️  refactor(core): non-feature, non-fix code change
 *   🧪 test(persona):   tests only
 *   🧹 chore:           tidying / hygiene
 *   🔧 chore(ci):       tooling / config
 *   ⚡ perf(session):   performance
 *   🔖 release:         version bump (changesets)
 *
 * Subject style: a tight topical noun phrase, not an imperative sentence.
 *   Good: `🐛 fix(bench/prep): LongMemEval gold`
 *   Good: `🔧 chore(scaffold): TS project + quality gate`
 *   Avoid: `🔧 chore: scaffold TypeScript project with full quality stack`
 *
 * The emoji is mandatory. See gitmoji.dev for the full reference, and the
 * project mirror at https://github.com/Eldriss-Studio/tardigrade-db
 * (CONTRIBUTING.md → "Commit Message Format").
 */
export default {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      // [emoji-or-emoji-sequence] [space] type(scope?): subject
      // The emoji may be a single Extended_Pictographic codepoint, optionally
      // followed by VS-16 (U+FE0F), optionally extended into a ZWJ sequence.
      headerPattern:
        /^(\p{Extended_Pictographic}(?:\u{FE0F})?(?:\u{200D}\p{Extended_Pictographic}(?:\u{FE0F})?)*)\s+(\w+)(?:\(([\w/\-.]+)\))?: (.+)$/u,
      headerCorrespondence: ["emoji", "type", "scope", "subject"],
    },
  },
  rules: {
    // Require the parser to find a type (which it only does when the emoji-prefix
    // regex matched). If someone forgets the emoji, this is what fails.
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "build",
        "ci",
        "revert",
        "release",
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "subject-case": [0],
    "header-max-length": [2, "always", 100],
    // Soft cap on subject length to encourage punchy noun-phrase style.
    // Warns at 50 chars; doesn't block.
    "subject-max-length": [1, "always", 50],
  },
};
