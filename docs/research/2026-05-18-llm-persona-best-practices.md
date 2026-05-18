# Research: LLM persona instruction best practices

- **Slug:** `2026-05-18-llm-persona-best-practices`
- **Date:** 2026-05-18
- **Status:** complete (extended on the same day by [emotion-and-memory research](./2026-05-18-llm-persona-emotion-and-memory.md))
- **Triggered by:** Task #6 (Persona + PersonaDirector) — needed evidence-based guidance on how to write a persona system prompt that *actually shifts decisions*, not just tone, before designing the `Persona` TypeScript type.
- **Informed:** `Persona` type design (pending implementation in task #6); the prompt-composition pattern that `LLMPlayer` will use (task #7).

## Question

What are the current (2024–2026) best practices for giving an LLM a persona via system prompt, with the unusual constraint that the LLM's output is reduced to a single `choiceIndex` integer (constrained via Zod schema and Vercel AI SDK's `generateObject`)? Specifically: what system-prompt structure shifts *decisions* rather than just tone? Where does the persona belong (system vs. user)? How do we keep it stable across turns? Does structured-output mode (JSON schema with reasoning + choiceIndex) preserve persona signal? How should multi-persona switching work? What's portable across providers? And — critically — is there empirical evidence that persona-driven choice selection works at all in narrative settings?

## Sources

### [Claude Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

- **Authors / Org:** Anthropic
- **Type:** vendor doc
- **Published:** ongoing (continuously updated)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The canonical system-prompt structure — role / scope / constraints / tone / output format — and the recommendation that persona content lives in the `system` channel (privileged top-level parameter on Claude) rather than re-injected in user turns. Optimal length guidance (200–1,000 words; accuracy plateaus around 2,000–4,000 tokens, degrades past ~5,500 on Claude) informed the 200–350-token target for poltergink personas.

### [OpenAI Model Spec (2025-12-18)](https://model-spec.openai.com/2025-12-18.html)

- **Authors / Org:** OpenAI
- **Type:** vendor spec
- **Published:** 2025-12-18
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The vendor-side guidance that shorter, more concise system messages perform better — and the crucial nuance that system role on OpenAI is less privileged than on Claude and *can* be overridden by sufficiently assertive user content. This is why the persona belongs in `system` even on OpenAI (where it amortizes well via caching) but should be kept terse and behavioural rather than padded.
- **Quoted:**
  > "Shorter, more concise system messages tend to perform better. Additionally, avoid overloading personalities with task logic or domain rules — keep them focused on how the agent responds, not what it must do."

### [OpenAI Cookbook — Prompt Personalities](https://developers.openai.com/cookbook/examples/gpt-5/prompt_personalities)

- **Authors / Org:** OpenAI
- **Type:** vendor cookbook
- **Published:** 2025 (GPT-5 era cookbook entry)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The most load-bearing single finding for poltergink's `Persona` design: the explicit distinction between *tone* (surface voice) and *behaviour-altering traits* (how the model decides under pressure, makes choices, handles ambiguity). This drove the choice to make `Persona.traits` a small set of behavioural dimensions (`riskTolerance`, `trustHeuristic`, `conflictApproach`) rather than free-text tone descriptors.
- **Quoted:**
  > "Personality dimensions are simple trait spectrums that shape how a bot tends to act, especially when under pressure, making choices, or handling ambiguity. Each trait affects how the bot solves problems, not just how it sounds."

### [Measuring and Controlling Persona Drift in Language Model Dialogs (ArXiv 2402.10962)](https://arxiv.org/html/2402.10962v1)

- **Authors / Org:** Anthropic researchers (Li, Chiang, et al.)
- **Type:** academic paper
- **Published:** 2024-02
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Empirical characterization of persona drift as a function of attention-mechanism decay over sequence length. Provided the threshold guidance that drift is rarely the blocker for typical Ink stories (5–30 turns), and the mitigation pattern — periodic one-line anchor reminders — for longer sessions. Justified leaving anchor-reminder injection as an opt-in feature, off by default.
- **Quoted:**
  > "In instruction-tuned LLMs, persona drift is defined as the gradual slip of the model's behavior away from its default 'helpful, harmless Assistant' identity into alternative character archetypes... the cause lies deep in the transformer's attention mechanism: as sequence length grows, the model's self-descriptive embeddings receive less weight compared to recent context tokens."

### [Character is Destiny: Can Large Language Models Simulate Persona-Driven Decisions in Role-Playing? (ArXiv 2404.12138 / EMNLP Findings 2025)](https://arxiv.org/abs/2404.12138)

- **Authors / Org:** Chen et al.
- **Type:** academic paper (EMNLP 2025 Findings)
- **Published:** 2024-04 (preprint), accepted EMNLP 2025
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The single most important validation that the whole poltergink premise works. Benchmark of 1,462 character decision points across 388 novels (LIFECHOICE dataset), state-of-the-art accuracy >60% on predicting character decisions from prior narrative context. Confirms that persona prompting *does* meaningfully shift narrative-choice selection — not just phrasing — and is a validated capability rather than wishful thinking. This is the evidence that justified building task #6 at all.

### [Playing Pretend: Expert Personas Don't Reliably Improve LLM Performance (SSRN 5879722)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5879722)

- **Authors / Org:** Savir Basil et al.
- **Type:** academic paper (SSRN preprint, meta-analysis)
- **Published:** 2026
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The crucial counterpoint that persona prompting *can backfire*. On factual-recall benchmarks like GPQA, no expert or low-knowledge persona reliably improved over baseline; cosmetic persona attributes (irrelevant names, colors, hobbies) can degrade performance by up to 30%. This drove the negative space in the `Persona` design — no `favouriteColor`, no `tone`, no cosmetic fields. Personas are for *decisions*, not for embellishment.

### [Structured Outputs in LLMs — Field Ordering Matters](https://collinwilkins.com/articles/structured-output)

- **Authors / Org:** Collin Wilkins (engineering blog)
- **Type:** engineering blog (well-regarded, primary observation rather than restatement)
- **Published:** 2026
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The specific finding that field order in a Zod / JSON schema is load-bearing — chain-of-thought models commit to an answer field before they finish reasoning when reasoning comes after. Drove the rule that `LLMPlayer`'s schema must be `{ reasoning, choiceIndex }` in that order, never `{ choiceIndex, reasoning }`.
- **Quoted:**
  > "If you put the answer field before reasoning fields in your schema, chain-of-thought models commit to an answer before they finish reasoning. Always put reasoning or explanation fields before answer or conclusion fields."

### [CrewAI — Crafting Effective Agents](https://docs.crewai.com/en/guides/agents/crafting-effective-agents)

- **Authors / Org:** CrewAI maintainers
- **Type:** open-source library doc
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Reference shape for production persona definitions in a popular agent framework — role + goal + backstory, where backstory encodes decision-making style. Confirmed our `Persona` shape aligns with industry-standard practice (identity + behavioural traits + decision principles), and reinforced the "switch the whole persona, don't blend" pattern when changing agents mid-session.

### [SillyTavern — Character Cards & Personas](https://docs.sillytavern.app/usage/characters/)

- **Authors / Org:** SillyTavern maintainers
- **Type:** open-source project doc
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Concrete shape of a well-honed roleplay persona format used by a large community (PNG-embedded JSON with name / description / personality / scenario / first_mes / examples). Validated the 300–500-token upper bound for richly defined personas and showed example-driven persona definition as a working pattern.

### [Optimal Prompt Length for AI Performance](https://particula.tech/blog/optimal-prompt-length-ai-performance)

- **Authors / Org:** Particula.tech
- **Type:** engineering blog (with empirical token-length tests)
- **Published:** 2025
- **Accessed:** 2026-05-18
- **Relevance:** low
- **What this contributed:** Empirical curve for prompt comprehension vs. length. Accuracy stable to ~2,000 tokens, plateaus to ~4,000, degrades 12% by 6,000 on GPT-4; Claude stable to ~5,500. Provided the 200–350-token sweet spot for the persona slice specifically.

## Synthesis

The findings cohere into a small set of locked design principles for poltergink's `Persona`:

**Persona traits should be behavioural dimensions, not cosmetic descriptors.** The OpenAI cookbook explicitly distinguishes tone from decision-making behaviour, and the SSRN meta-analysis quantifies the cost of getting this wrong — up to 30% performance drop from irrelevant persona attributes. So `Persona.traits` is a small enum-set of axes that genuinely flip choices: how this character weighs risk, how they decide who to trust, how they handle conflict. Not `favouriteColor`, not free-text "witty and charming". The static `Persona` type is intentionally narrow on this axis.

**Persona lives in the `system` channel, current-turn context lives in `user`.** Anthropic and OpenAI converge here; the persona stays stable across turns and benefits from caching / amortization. Vercel AI SDK abstracts the per-provider translation, so the `LLMPlayer` just passes `system:` and `prompt:` and the SDK does the right thing on each backend.

**Markdown sections, not XML.** Anthropic accepts XML, OpenAI prefers Markdown, Google sits between them. Markdown sections (`## Identity & Role`, `## Decision-Making Style`, `## Key Traits`, `## Constraints`, `## Output Format`) work cleanly across all providers.

**Schema is `{ reasoning, choiceIndex }` with reasoning first.** Field order is load-bearing for chain-of-thought models. Reasoning before answer preserves persona signal even under constrained output. The `reasoning` field is what flows into `Transcript.turns[i].decision.reasoning` for debugging and replay.

**Mid-session persona switching rewrites the system prompt; conversation history persists.** Blending personas in context risks conflation. The Ink narrative state (knot, visited flags, variables) is the world; the persona is the agent. Reset the agent, keep the world.

**Drift mitigation is opt-in, off by default.** For typical Ink stories (5–30 turns), attention-decay-driven drift is rarely the blocker. Past ~20 turns, optionally inject a one-line anchor reminder before each subsequent turn. Don't pay this cost up front on short sessions.

**Refusals are surfaced at the provider layer, not modeled in the schema.** A `Detective refuses bribery` constraint goes in the prompt; if the LLM refuses, Vercel AI SDK exposes `message.refusal` and we translate it into a typed `LLMPlayerRefusalError`. The Zod schema stays clean.

**The premise is empirically validated.** *Character is Destiny* shows >60% accuracy on predicting character decisions from novels. Persona-driven narrative choice is a real capability, not a hope.

## Downstream uses

- Pending: the `Persona` TypeScript type definition (task #6) will encode these decisions directly — behavioural-trait axes, no cosmetic fields, decision principles as bullet list.
- Pending: the `LLMPlayer` prompt composition (task #7) will follow the Markdown-section structure and the `{ reasoning, choiceIndex }` schema shape with reasoning first.
- Extended same-day by the [emotion-and-memory research](./2026-05-18-llm-persona-emotion-and-memory.md), which adds the *dynamic* layer (mood + memory) that this research's static-only persona model was missing.
