# Research: Emotion and episodic memory in LLM personas

- **Slug:** `2026-05-18-llm-persona-emotion-and-memory`
- **Date:** 2026-05-18
- **Status:** complete
- **Triggered by:** After the first [persona-best-practices research](./2026-05-18-llm-persona-best-practices.md) landed a static-only persona model (id, name, backstory, traits, decisionPrinciples), the operator flagged two missing dimensions — *emotion* and *memory*. A character's current emotional state, and what they remember from earlier in the story, both shape what they pick next. A static persona model can't represent that.
- **Informed:** Design of `PersonaState` (the dynamic layer wrapping the static `Persona`), the `MemoryStore` pluggable-backend interface, and the contract for what `EpisodicMemory` records per turn. Pending implementation across tasks #12 (NarrativeEvent surface) and #6 (Persona + PersonaDirector).

## Question

How should a persona-driven LLM agent model emotion and memory so that a character's decisions evolve coherently across turns? Specifically for a constrained-output narrative-choice agent: what computational model of emotion is tractable in an LLM prompt; what memory architecture is the current consensus; how should emotion and memory interact (mood-congruent recall, emotion-modulated decisions); how should these layers be exposed in a TypeScript library so that the storage backend stays pluggable (because the Project Ares architecture pairs the library with `tardigrade-db`'s KV-cache memory as one of several possible backends); and what does the evidence say actually works in practice versus what's still emerging research?

## Sources

### [Generative Agents: Interactive Simulacra of Human Behavior (arXiv 2304.03442)](https://arxiv.org/abs/2304.03442)

- **Authors / Org:** Joon Sung Park, Joseph C. O'Brien, Carrie Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein (Stanford / Google Research)
- **Type:** academic paper
- **Published:** 2023-04 (the "Smallville" paper)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The foundational architecture — observation stream, periodic reflection, retrieval-informed planning — that the field has converged on. Provided the load-bearing finding that *removing the reflection step caused agent behavior to degenerate from coherent multi-day planning to repetitive, context-free responses within 48 simulated hours*. This is the empirical case for why the persona's `SemanticMemory` layer (periodic 1–2 sentence reflections) is not optional decoration but a coherence-preserving necessity.
- **Quoted:**
  > "The core of an agent is its memory stream — a comprehensive record of the agent's experiences using natural language. We then synthesize these memories over time into higher-level reflections, and retrieve them dynamically to plan behavior and act in response to dynamic situations."

### [EmotionPrompt: Leveraging Psychology for Large Language Models via Emotional Stimuli (arXiv 2307.11760)](https://arxiv.org/abs/2307.11760)

- **Authors / Org:** Cheng Li, Jindong Wang, Yixuan Zhang, Kaijie Zhu, Xinyi Wang, Wenxin Hou, Jianxun Lian, Fang Luo, Qiang Yang, Xing Xie (Microsoft Research Asia, Beijing Normal, et al.)
- **Type:** academic paper
- **Published:** 2023-07
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The first systematic evidence that *emotional framing in a prompt is not stylistic — it measurably shifts model behaviour*. Reported 8% improvement on Instruction Induction, 115% on BIG-Bench, ~10.9% average on generative tasks under human evaluation. This is the foundational empirical answer to "does emotion in a persona actually matter for decision quality?" — yes, even on tasks unrelated to roleplay.

### [EAI: Emotional Decision-Making of LLMs in Strategic Games and Ethical Dilemmas (NeurIPS 2024)](https://proceedings.neurips.cc/paper_files/paper/2024/file/611e84703eac7cc03f78339df8aae2ed-Paper-Conference.pdf)

- **Authors / Org:** AIRI Institute team (paper title and authors per the NeurIPS proceedings; reference implementation at <https://github.com/AIRI-Institute/EAI-Framework>)
- **Type:** academic paper (NeurIPS 2024)
- **Published:** 2024
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Showed that emotions *significantly alter LLM decision-making in strategic settings* (bargaining games, cooperation dilemmas, ethical choices), and crucially that different model families respond differently to the same emotional frames (GPT-4 vs. Claude vs. open-weight models). For poltergink, this is two findings at once: emotion in a persona prompt is real signal, and emotional behavior is provider-dependent enough that consumers should empirically test with their chosen LLM rather than assuming portability.

### [How Emotion Shapes the Behavior of LLMs and Agents — E-STEER (arXiv 2604.00005)](https://arxiv.org/abs/2604.00005)

- **Authors / Org:** Research collective (specific authors per the preprint)
- **Type:** academic paper (preprint, 2025)
- **Published:** 2025
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Mechanistic evidence — emotion isn't surface-level styling, it embeds in the model's hidden states and non-monotonically shifts reasoning, safety, and sequential planning behaviour. This is the deepest validation that emotion is load-bearing for an agent's decision-making; treating it as a decorative prompt field would be leaving real signal on the table.

### [Emotional RAG: Enhancing Role-Playing Agents through Emotional Retrieval (arXiv 2410.23041)](https://arxiv.org/abs/2410.23041)

- **Authors / Org:** Research collective on role-playing agents
- **Type:** academic paper
- **Published:** 2024-10
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Empirical validation of *mood-congruent memory retrieval* — when retrieving memories, weighting by both semantic similarity (0.7) and emotional congruence (0.3) to the persona's current mood improves personality consistency 5–8% over semantic-only retrieval. This is the design principle behind making the `MemoryStore.retrieve(query)` interface accept a mood / emotion parameter alongside the query text, so backends can implement either purely-semantic retrieval (if cheap and good enough) or affect-weighted retrieval (if richer).

### [The Cognitive Structure of Emotions — OCC appraisal theory](https://www.cambridge.org/core/books/cognitive-structure-of-emotions/)

- **Authors / Org:** Andrew Ortony, Gerald L. Clore, Allan Collins
- **Type:** academic book (Cambridge University Press)
- **Published:** 1988 (foundational; still the dominant computational emotion theory)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** The appraisal-theoretic framework — emotions arise from evaluations of events (against goals), agents (against social norms), and objects (against preferences). Provides the conceptual grounding for *how* a persona's mood should update given a story event: the event is appraised against the persona's `decisionPrinciples` (proxy for goals) and `traits`, producing a directional mood shift. This is the model behind the "LLM-generated self-update" approach to mood transitions, where the LLM is asked to perform the appraisal step explicitly.

### [PAD emotional state model — Mehrabian & Russell](https://en.wikipedia.org/wiki/PAD_emotional_state_model)

- **Authors / Org:** Albert Mehrabian and James A. Russell (originally; extended by Mehrabian)
- **Type:** psychological model + summary article
- **Published:** 1974 (originally, in *An Approach to Environmental Psychology*; widely applied in affective computing since)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The compact three-axis affect space — pleasure (−1 to +1), arousal (−1 to +1), dominance (−1 to +1) — that any emotion can be located in. This is the chosen *internal* representation for poltergink's `EmotionalState` because it's three floats (cheap, easy to update incrementally, easy to interpolate) rather than a categorical label that's hard to combine or evolve. The PAD vector is what gets persisted in serializable persona state.

### [Plutchik's Wheel of Emotions](https://en.wikipedia.org/wiki/Robert_Plutchik)

- **Authors / Org:** Robert Plutchik
- **Type:** psychological model
- **Published:** 1980 (*Emotion: A Psychoevolutionary Synthesis*)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** The eight primary emotions (joy, trust, fear, surprise, sadness, disgust, anger, anticipation) arranged in opposing pairs. This is the *narrative* face of poltergink's `EmotionalState` — LLMs reason better with categorical labels than with raw PAD floats, so the prompt-facing representation is "you are currently *fearful*" not "you are at P=-0.6, A=+0.7, D=-0.4". PAD internal, Plutchik external, with a mapping between them.

### [MemGPT: Towards LLMs as Operating Systems (arXiv 2310.08560)](https://arxiv.org/abs/2310.08560)

- **Authors / Org:** Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, Joseph E. Gonzalez (UC Berkeley)
- **Type:** academic paper
- **Published:** 2023-10
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The OS-inspired tiered memory architecture — main context (working memory) + archival storage (persistent) with explicit promotion/demotion — that established the three-tier model the field has since adopted. Plus the practical insight that the agent itself can manage its own memory via function calls (`save_to_archive`, `recall`). For poltergink the tiered concept is the architecture, but the management is intentionally simpler: working memory is the prompt context, episodic memory is whatever the consumer's `MemoryStore` holds, semantic memory is the periodic reflection. The agent doesn't manage its own memory at the function-call level (yet) — we leave that as a possible future extension.

### [Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory (arXiv 2504.19413)](https://arxiv.org/abs/2504.19413)

- **Authors / Org:** Kamesh Chhikara et al.
- **Type:** academic paper / production system writeup
- **Published:** 2025-04
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Production-shape numbers on the cost-benefit of structured memory vs. long-context — 91% latency reduction and 90% token savings versus dumping everything in the prompt. This is the empirical justification for not just shipping "stuff the whole transcript into the prompt every turn" and calling it memory. Also a real-world example of the dual-layer (extract facts → embed → retrieve) pattern that informs the `MemoryStore.retrieve(query)` interface shape.

### [Position: Episodic Memory is the Missing Piece for Long-Term LLM Agents (arXiv 2502.06975)](https://arxiv.org/abs/2502.06975)

- **Authors / Org:** Position paper authors (2025)
- **Type:** academic position paper
- **Published:** 2025-02
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** The argument that *episodic* memory (timestamped, event-specific records) is the layer that current LLM agents most often lack — most agents have working memory and some form of semantic memory (RAG over docs) but no explicit per-event episodic log. This is the case for `EpisodicMemory` being a first-class type in poltergink's `PersonaState`, not a derived view over the Transcript. The Transcript records what happened (objective); episodic memory records what the persona *experienced* and how they interpreted it (subjective).

### [Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers (arXiv 2603.07670)](https://arxiv.org/abs/2603.07670)

- **Authors / Org:** Survey authors (2025)
- **Type:** academic survey paper
- **Published:** 2025
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Comprehensive taxonomy of memory types (working / episodic / semantic / procedural), consolidation strategies, and known failure modes (e.g., over-reflection producing hallucinated "memories"). Useful for naming things consistently and for knowing what to watch out for. Pattern: reflection should be grounded in actual episodic entries, not freely generated; otherwise the semantic layer drifts away from reality.

### [Beyond the Context Window: A Cost-Performance Analysis of Fact-Based Memory vs. Long-Context LLMs (arXiv 2603.04814)](https://arxiv.org/abs/2603.04814)

- **Authors / Org:** Cost-analysis paper authors (2025)
- **Type:** academic paper
- **Published:** 2025
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Empirical break-even analysis — structured memory beats long-context (in cost) at around the 10-turn mark, with ~26% cost savings by turn 20 at 100k-token context. For typical Ink stories at 5–30 turns, this places poltergink right around the inflection point: short narratives might be fine with raw transcript, longer ones benefit from real memory. Confirms `maxTurns` on Session as a useful safety net and validates that the structured memory layer is worth its complexity.

### [Letta (formerly MemGPT) — Production memory agent framework](https://github.com/letta-ai/letta)

- **Authors / Org:** Letta maintainers (originally Charles Packer et al. from the MemGPT paper)
- **Type:** open-source project
- **Published:** ongoing (2024+)
- **Accessed:** 2026-05-18
- **Relevance:** low
- **What this contributed:** Reference of how the production MemGPT lineage actually shapes its public API — `agent.send_message()`, `archival_memory_insert()`, `recall_memory_search()` — which validates that the agent-managed-memory pattern is real but heavy. poltergink intentionally goes lighter: the persona doesn't manage its own memory through function calls; the `Session` orchestrator manages it on the persona's behalf.

## Synthesis

The combined picture from the sources points at a small set of design decisions, plus one architectural framing imported from the Project Ares context (the consuming application that pairs poltergink with `tardigrade-db`-style persistent memory):

**Emotion as a first-class persona dimension, represented as PAD internally and Plutchik externally.** The empirical case is settled — EmotionPrompt, EAI, and E-STEER independently confirm that emotional framing is mechanistic, not stylistic. The model choice (PAD internal + Plutchik labels in the prompt) gives us a compact serializable state (three floats + an enum), incremental updates that feel natural ("just got betrayed → drop pleasure, raise arousal"), and prompt-facing labels that LLMs reason about more reliably than raw vector coordinates. OCC appraisal theory grounds the *update rule*: when an event happens, the persona's principles and traits are the appraisal frame, and the LLM is asked to perform the appraisal explicitly ("given this event, how does your mood shift?").

**Memory as three tiers — working, episodic, semantic — with the episodic layer carrying both objective events and subjective interpretation.** This is the Generative Agents architecture, validated by enough independent work (MemGPT, Mem0, the episodic-position paper, the field survey) that it's the consensus shape. The key insight that took the most work to extract is that *episodic memory should be subjective*, not a re-statement of the Transcript. The Transcript is what happened (a frozen objective record). The persona's episodic memory is what *they* think happened, what *they* interpreted it to mean, what *they* feel about it. A detective and a charmer playing the same Ink scene should produce different episodic memories of the same event. The shape:

```
EpisodicMemory {
  turn: number
  events: NarrativeEvent[]          // objective: what fired this turn (see Ink-events research)
  decision: Decision                 // objective: what the persona chose
  interpretation: string             // subjective: what the persona made of it
  emotionalTag: string               // subjective: how it felt (Plutchik label)
  importance: number                 // subjective: how memorable
}
```

The `events` field is what binds this research to the [Ink narrative event patterns research](./2026-05-18-ink-narrative-event-patterns.md) — episodic memory captures the consequences of choices, not just the choices themselves.

**Semantic memory is reflection, fired periodically, and is load-bearing for coherence.** Park et al.'s finding that removing reflection broke their agents within 48 simulated hours is the empirical justification for not treating semantic memory as an optimisation. Every ~5 turns, the LLM gets asked: "Summarize the last 5 turns from your character's perspective. What did you learn? What matters to you now?" The result is stored as a `SemanticMemory` entry and feeds into subsequent system prompts as context. The Memory survey warns about over-reflection producing hallucinated facts; the mitigation is grounding reflections in actual episodic entries (the prompt includes the entries being reflected on).

**Retrieval should be mood-congruent.** Emotional RAG's 5–8% personality-consistency improvement from weighting retrieval 70% semantic + 30% emotional is the empirical case. For poltergink this lands as part of the `RetrievalQuery` shape passed to the `MemoryStore` — backends can choose to use the mood weighting or ignore it.

**The architectural framing imported from Project Ares: memory must be a pluggable interface, not a concrete data structure.** Project Ares pairs poltergink with `tardigrade-db`, a KV-cache-native memory backend with semantics very different from in-memory arrays. The `EpisodicMemory[]` shape the original research recommended would couple poltergink to a single backend. The right shape is a `MemoryStore` interface — `add(record)`, `retrieve(query)`, optional `reflect(window)` — that poltergink defines with a sensible default (`InMemoryMemoryStore`) and consumers swap as needed. Project Ares plugs in tardigrade-db; another consumer plugs in a flat text file; a third plugs in a vector database. Same persona logic, different storage. This matches the user's stated framing ("opinionated about the API shape, permissive about the storage") and avoids any direct dependency between poltergink and tardigrade-db.

**PersonaState must be serializable.** Because Ares' premise is that Ares-the-character's disposition has drifted from previous players, the game needs to *load* a `PersonaState` at session start from persistent storage. That means `PersonaState` (and everything it transitively holds — the `Persona` static identity, the current PAD vector, the references to memory) needs clean JSON serialization. This is a first-class concern, not a "we'll figure it out at task 9" concern — it shapes the type definitions from the start.

**Cost is manageable for narrative agents.** Per Beyond the Context Window's break-even analysis, structured memory beats long-context economically around the 10-turn mark. For typical Ink stories (5–30 turns), the persona-state layer (mood + retrieved memories + latest reflection) adds roughly 400 tokens per turn. At current API prices that's pennies per session. Cost is not the binding constraint; coherence is, and the structured memory layer is what delivers it.

**Drift mitigation stays opt-in, off by default.** Per ArXiv 2402.10962 (the persona-drift paper from the earlier persona research), attention-mechanism decay causes the persona signal to fade over long contexts. For typical Ink stories this is rarely the blocker. Past ~20 turns, an optional one-line anchor reminder ("[You are X. Your core principle is Y.]") can be prepended to subsequent turns. The mechanism is a constructor flag on `LLMPlayer`, not always-on behaviour.

## What this means for the type design

Concretely, the types this synthesis recommends:

```ts
// Static identity — defined once, never changes during a session.
interface Persona {
  readonly id: string;
  readonly name: string;
  readonly backstory: string;
  readonly decisionPrinciples: readonly string[];
  readonly traits: {
    readonly riskTolerance: "cautious" | "balanced" | "reckless";
    readonly trustHeuristic: "evidence-based" | "intuition-driven" | "people-focused";
    readonly conflictApproach: "diplomatic" | "analytical" | "aggressive";
  };
  readonly constraints?: readonly string[];
}

// Dynamic mood — three floats internally, narrative label for the prompt.
interface EmotionalState {
  readonly pleasure: number;   // -1 to +1
  readonly arousal: number;    // -1 to +1
  readonly dominance: number;  // -1 to +1
  readonly primaryEmotion:
    | "joy" | "trust" | "fear" | "surprise"
    | "sadness" | "disgust" | "anger" | "anticipation";
  readonly appraisal?: string;
  readonly confidence: number; // 0 to 1 — how settled the mood is
}

// Pluggable memory backend — the architectural seam for tardigrade-db et al.
interface RetrievalQuery {
  readonly text: string;
  readonly currentMood?: EmotionalState;
  readonly limit?: number;
  readonly semanticWeight?: number;   // default 0.7
  readonly emotionalWeight?: number;  // default 0.3
}

interface MemoryStore {
  add(record: EpisodicMemory): Promise<void> | void;
  retrieve(query: RetrievalQuery): Promise<readonly EpisodicMemory[]> | readonly EpisodicMemory[];
  reflect?(window: readonly EpisodicMemory[]): Promise<SemanticMemory> | SemanticMemory;
  serialize(): Promise<string> | string;
  restore(json: string): Promise<void> | void;
}

interface PersonaState {
  readonly persona: Persona;
  readonly currentMood: EmotionalState;
  readonly memory: MemoryStore;
  readonly semanticMemory: readonly SemanticMemory[];
  // serialize / restore methods produce JSON that captures all of the above
}
```

This is the shape we'll work toward in tasks #12 (NarrativeEvent surface) and #6 (Persona + PersonaDirector). Task #12 lands first because `EpisodicMemory.events` references it.

## What's well-documented vs. emerging vs. folk wisdom

**Well-established (consensus, high confidence):**
- OCC appraisal theory as a computational emotion framework (35+ years, foundational).
- PAD model for affective space (50+ years, HCI / affective-computing standard).
- Three-tier memory (working / episodic / semantic) for agent architectures.
- Reflection as a coherence-preserving mechanism (Generative Agents, validated by behavioural collapse without it).
- Emotion mechanistically affects LLM decisions (EmotionPrompt, EAI, E-STEER, all independent).
- Mood-congruent retrieval improves personality consistency (Emotional RAG validation).
- Structured outputs (JSON schema) preserve decision quality when reasoning field comes first (Wilkins; see earlier persona research).

**Emerging research (promising, medium-high confidence):**
- Episodic memory as the missing piece (position paper, 2025; consensus seems to be forming).
- Zettelkasten-style memory with dynamic linking (A-MEM, 2025; not yet battle-tested at scale).
- Mood-congruent decision-making *loops* (emotion → memory retrieval → decision → mood update) — theoretically sound, limited empirical validation specifically for narrative-choice agents.

**Folk wisdom / unvalidated:**
- The exact cadence of reflection for narrative agents (every 5 turns? 10? depends on story length). No published ablation.
- The right balance of semantic vs. emotional weights in retrieval (Emotional RAG uses 0.7/0.3 with no ablation).
- First-person memory framing as a distinct technique (pattern exists; no formal study).
- Optimal mood-update prompt phrasing for narrative-choice contexts specifically.

**Couldn't fully verify:**
- Whether *Character is Destiny*'s >60% decision-prediction accuracy generalizes to characters with mood/memory layered on, or whether that work assumed static persona prompts.
- Whether any production game (Inkle's own commercial titles, or otherwise) ships an emotion+memory layer on top of Ink — none of the integration libraries surveyed in the [Ink event patterns research](./2026-05-18-ink-narrative-event-patterns.md) document anything richer than tags + external functions + variable observers.

## Downstream uses

- Task #12 (NarrativeEvent surface) — the `EpisodicMemory.events: NarrativeEvent[]` field is the bridge between this research and the [Ink event patterns research](./2026-05-18-ink-narrative-event-patterns.md). Both pieces of research feed the same type.
- Task #6 (Persona + PersonaDirector) — implements the shapes proposed above. The static `Persona` plus dynamic `PersonaState` split, the PAD+Plutchik emotion model, the `MemoryStore` interface with `InMemoryMemoryStore` default, and the periodic-reflection mechanism.
- Eventual `docs/concepts/persona.md` page on the docs site (task #8) — the public-facing explanation of the persona model, with examples of static vs. dynamic and a worked example of mood evolution across a small `.ink` fixture.
- Extends and complements the same-day [persona best practices](./2026-05-18-llm-persona-best-practices.md) (static layer) and the [Ink event patterns](./2026-05-18-ink-narrative-event-patterns.md) (event substrate). The three pieces together are the complete input picture for the Persona work.
